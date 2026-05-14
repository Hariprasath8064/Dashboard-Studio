const axios = require('axios');
const http = require('http');
const https = require('https');
const { XMLParser } = require('fast-xml-parser');
const logger = require('../config/logger');
const { encodeXml, sanitizeXml, splitTuple } = require('../utils/xmlHelpers');
const { xmlRegistry } = require('../utils/xmlRegistry');
const { generateQuery } = require('../utils/relevanceBuilder');

const getAxiosConfig = () => ({
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': '"http://schemas.bigfix.com/Relevance/GetRelevanceResult"'
  },
  responseType: 'text',
  timeout: 60000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true })
});

const getParserOptions = () => ({
  ignoreAttributes: true,
  removeNSPrefix: true,
  processEntities: {
    enabled: true,
    maxTotalExpansions: 5000000
  }
});

// Read BigFix credentials from environment variables (.env file)
const getCredentials = () => {
  const url = process.env.BIGFIX_URL || '';
  const username = process.env.BIGFIX_USERNAME || '';
  const password = process.env.BIGFIX_PASSWORD || '';
  return { url, username, password };
};

const evaluateQuery = async (req, res) => {
  try {
    const { url, username, password } = getCredentials();
    if (!url || !username) {
      return res.status(401).json({ error: 'BigFix credentials not configured in .env (BIGFIX_URL, BIGFIX_USERNAME, BIGFIX_PASSWORD).' });
    }

    const { query, split } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query parameter.' });

    const cleanQuery = query.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const soapPayload = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rel="http://schemas.bigfix.com/Relevance">
        <soap:Body><rel:GetRelevanceResult><rel:relevanceExpr>${encodeXml(cleanQuery)}</rel:relevanceExpr><rel:username>${encodeXml(username)}</rel:username><rel:password>${encodeXml(password)}</rel:password></rel:GetRelevanceResult></soap:Body>
      </soap:Envelope>`;

    const startTime = Date.now();
    const response = await axios.post(`${url.replace(/\/$/, '')}/webreports`, soapPayload, getAxiosConfig());

    const jsonObj = new XMLParser(getParserOptions()).parse(sanitizeXml(response.data));
    const body = jsonObj?.Envelope?.Body;

    if (body?.Fault) throw new Error(`${body.Fault.faultstring}`);
    const responseBody = body?.GetRelevanceResultResponse;
    if (!responseBody) throw new Error('Invalid XML structure returned.');

    let resultsArray = responseBody.a;
    if (resultsArray == null) resultsArray = [];
    else if (!Array.isArray(resultsArray)) resultsArray = [resultsArray];

    let finalData = resultsArray.map(row => {
      const stringRow = typeof row === 'object' ? JSON.stringify(row) : String(row);
      if (split) {
        if (stringRow.includes('$x$')) return stringRow.split('$x$').map(cell => cell.trim());
        return splitTuple(stringRow);
      }
      return [stringRow];
    });

    res.json({ data: finalData, executionTimeMs: Date.now() - startTime, rowCount: finalData.length });
  } catch (error) {
    logger.error(`BigFix evaluate error: ${error.message}`);
    res.status(500).json({ error: 'BigFix Error', details: error.message });
  }
};

const executeStructuredQuery = async (req, res) => {
  try {
    const { url, username, password } = getCredentials();
    if (!url || !username) {
      return res.status(401).json({ error: 'BigFix credentials not configured in .env.' });
    }

    const { objectType, selectedProps, filters, filterLogic, sites } = req.body;

    const availableProps = xmlRegistry.getPropertiesFor(objectType);
    const cleanQuery = generateQuery(objectType, selectedProps, availableProps, filters, filterLogic, sites);

    const soapPayload = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rel="http://schemas.bigfix.com/Relevance">
        <soap:Body><rel:GetRelevanceResult><rel:relevanceExpr>${encodeXml(cleanQuery)}</rel:relevanceExpr><rel:username>${encodeXml(username)}</rel:username><rel:password>${encodeXml(password)}</rel:password></rel:GetRelevanceResult></soap:Body>
      </soap:Envelope>`;

    const startTime = Date.now();
    const response = await axios.post(`${url.replace(/\/$/, '')}/webreports`, soapPayload, getAxiosConfig());

    const jsonObj = new XMLParser(getParserOptions()).parse(sanitizeXml(response.data));
    const body = jsonObj?.Envelope?.Body;

    if (body?.Fault) throw new Error(`${body.Fault.faultstring}`);

    let resultsArray = body?.GetRelevanceResultResponse?.a || [];
    if (!Array.isArray(resultsArray)) resultsArray = [resultsArray];

    let finalData = resultsArray.map(row => {
      const stringRow = typeof row === 'object' ? JSON.stringify(row) : String(row);
      if (stringRow.includes('$x$')) return stringRow.split('$x$').map(cell => cell.trim());
      return splitTuple(stringRow);
    });

    res.json({
      data: finalData,
      executionTimeMs: Date.now() - startTime,
      rowCount: finalData.length,
      generatedQuery: cleanQuery
    });
  } catch (error) {
    logger.error(`BigFix structured query error: ${error.message}`);
    res.status(500).json({ error: 'BigFix Error', details: error.message });
  }
};

const getSchema = (req, res) => {
  try {
    const objectType = req.params.objectType;
    const properties = xmlRegistry.getPropertiesFor(objectType);
    res.json(properties || []);
  } catch (error) {
    logger.error(`Schema error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch schema', details: error.message });
  }
};

const getSites = async (req, res) => {
  try {
    const { url, username, password } = getCredentials();
    if (!url || !username) {
      return res.status(401).json({ error: 'BigFix credentials not configured in .env.' });
    }

    const qSites = `unique values of ((operator site flag of it as string & "||" & (if (name of it = "Enterprise Security") then ("Patches for Windows") else (name of it))) of all bes sites)`;

    const soapPayload = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rel="http://schemas.bigfix.com/Relevance"><soap:Body><rel:GetRelevanceResult><rel:relevanceExpr>${encodeXml(qSites)}</rel:relevanceExpr><rel:username>${encodeXml(username)}</rel:username><rel:password>${encodeXml(password)}</rel:password></rel:GetRelevanceResult></soap:Body></soap:Envelope>`;

    const response = await axios.post(`${url.replace(/\/$/, '')}/webreports`, soapPayload, getAxiosConfig());
    const jsonObj = new XMLParser(getParserOptions()).parse(sanitizeXml(response.data));

    if (jsonObj?.Envelope?.Body?.Fault) throw new Error(`${jsonObj.Envelope.Body.Fault.faultstring}`);
    let resultsArray = jsonObj?.Envelope?.Body?.GetRelevanceResultResponse?.a || [];
    if (!Array.isArray(resultsArray)) resultsArray = [resultsArray];

    const sites = resultsArray.map(item => {
      const stringItem = typeof item === 'object' ? JSON.stringify(item) : String(item);
      const parts = stringItem.split('||');
      return {
        isOperator: parts[0] === 'True',
        name: parts[1] || 'Unknown Site',
        fixletCount: 0
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    res.json(sites);
  } catch (error) {
    logger.error(`Sites error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch sites', details: error.message });
  }
};

const getWizardProperties = async (req, res) => {
  try {
    const { url, username, password } = getCredentials();
    if (!url || !username) {
      return res.status(401).json({ error: 'BigFix credentials not configured in .env.' });
    }

    const qGlobal = `(name of it & "||" & id of it as string) of bes properties whose (analysis flag of it = false and name of it does not start with "_BESClient")`;
    const qAnalysis = `(name of source analysis of it & "||" & name of it & "!!" & id of it as string) of bes properties whose (analysis flag of it = true and active flag of best activations of source analysis of it = true)`;

    const createSoap = (query) =>
      `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rel="http://schemas.bigfix.com/Relevance"><soap:Body><rel:GetRelevanceResult><rel:relevanceExpr>${encodeXml(query)}</rel:relevanceExpr><rel:username>${encodeXml(username)}</rel:username><rel:password>${encodeXml(password)}</rel:password></rel:GetRelevanceResult></soap:Body></soap:Envelope>`;

    const endpoint = `${url.replace(/\/$/, '')}/webreports`;
    const [resGlobal, resAnalysis] = await Promise.all([
      axios.post(endpoint, createSoap(qGlobal), getAxiosConfig()),
      axios.post(endpoint, createSoap(qAnalysis), getAxiosConfig())
    ]);

    const parseXml = (xml) => {
      const jsonObj = new XMLParser(getParserOptions()).parse(sanitizeXml(xml));
      const body = jsonObj?.Envelope?.Body;
      if (body?.Fault) throw new Error(`${body.Fault.faultstring}`);
      let arr = body?.GetRelevanceResultResponse?.a || [];
      return Array.isArray(arr) ? arr : [arr];
    };

    const globalProps = parseXml(resGlobal.data).map(item => {
      const parts = item.split('||');
      return { name: parts[0], id: parts[1], type: 'Global Properties' };
    });

    const analysisProps = parseXml(resAnalysis.data).map(item => {
      const parts = item.split('||');
      const subParts = parts[1] ? parts[1].split('!!') : [parts[1], ''];
      return { name: subParts[0], id: subParts[1], analysisName: parts[0], type: 'Analysis Properties' };
    });

    const allProps = [...globalProps, ...analysisProps].sort((a, b) => a.name.localeCompare(b.name));
    res.json(allProps);
  } catch (error) {
    logger.error(`Wizard properties error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
  }
};

module.exports = {
  evaluateQuery,
  getWizardProperties,
  getSites,
  executeStructuredQuery,
  getSchema
};

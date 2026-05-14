const { xmlRegistry } = require('./xmlRegistry');
const { buildFilterClause } = require('./filterBuilder');

const buildSiteClause = (sites, objectType) => {
  if (!sites || sites.length === 0) return '';
  if (!Array.isArray(sites)) sites = [sites];

  const clauses = sites.map(s => {
    let siteCondition = `name of it = "${s}" OR display name of it = "${s}"`;
    if (s === 'Patches for Windows') {
      siteCondition = `name of it = "Enterprise Security" OR display name of it = "Patches for Windows"`;
    }

    if (objectType === 'BES Actions') {
      return `(exists source fixlet whose (exists site whose (${siteCondition}) of it) of it)`;
    } else if (objectType === 'BES Action Results') {
      return `(exists action whose (exists source fixlet whose (exists site whose (${siteCondition}) of it) of it) of it)`;
    } else if (objectType === 'BES Fixlet Results') {
      return `(exists fixlet whose (exists site whose (${siteCondition}) of it) of it)`;
    } else {
      return `(exists site whose (${siteCondition}) of it)`;
    }
  });

  return `(${clauses.join(' OR \n\t\t\t')})`;
};

const generateQuery = (objectType, selectedRelevancePaths, availableProps = [], filters = [], filterLogic = 'AND', selectedSites = []) => {
  if (!selectedRelevancePaths || selectedRelevancePaths.length === 0) return '';

  const colSep  = '$x$';
  const valSep  = '%0A';
  const nullSub = '<none>';

  const pluralObjName = xmlRegistry.getPluralName(objectType);
  let targetObjectStr = `\n\t${pluralObjName}`;

  const filterClause = buildFilterClause(filters, availableProps, filterLogic);
  const siteClause   = buildSiteClause(selectedSites, objectType);

  if (siteClause || filterClause) {
    targetObjectStr += ` \n\t\twhose (\n\t\t\t`;
    if (siteClause)  targetObjectStr += siteClause;
    if (siteClause && filterClause) targetObjectStr += ` AND \n\t\t\t`;
    if (filterClause) targetObjectStr += `(${filterClause})`;
    targetObjectStr += `\n\t\t)`;
  }

  const attrStrParts = selectedRelevancePaths.map(relPath => {
    const propDef = availableProps.find(p => p.relevancePath === relPath);

    if (propDef && (propDef.type === 'Analysis Properties' || propDef.type === 'Global Properties')) {
      const propSelector = propDef.id
        ? `bes property whose (id of it = ${propDef.id} AND name of it = "${propDef.name}")`
        : `bes property "${propDef.name}"`;
      const valRef = `values of results (it, ${propSelector})`;
      return `\n\t(if (exists ${valRef}) then (concatenation "${valSep}" of (${valRef} as string)) else ("${nullSub}"))`;
    }

    if (propDef && propDef.type === 'Custom') {
      return `\n\t(if (exists (${propDef.relevancePath})) then (concatenation "${valSep}" of ((${propDef.relevancePath}) as string)) else ("${nullSub}"))`;
    }

    let baseObjectExistsCheck = `exists ${relPath} of it`;
    if (relPath.includes(' of ')) {
      const parts = relPath.split(' of ');
      if (parts.length >= 2) {
        const baseObject = parts.slice(1).join(' of ');
        baseObjectExistsCheck = `exists ${baseObject} of it`;
      }
    }

    return `\n\t(if (${baseObjectExistsCheck} AND exists ${relPath} of it) then (concatenation "${valSep}" of (${relPath} of it as string)) else ("${nullSub}"))`;
  });

  const attrStr = `(${attrStrParts.join(', ')}) `;

  let itemStr = selectedRelevancePaths.length === 1
    ? `(it as string) \nof `
    : `(\n${selectedRelevancePaths.map((p, i) => `\titem ${i} of it as string `).join(` & "${colSep}" & \n`)}\n) \nof `;

  return `${itemStr} \n${attrStr} \nof ${targetObjectStr}`;
};

module.exports = { generateQuery };

const { xmlRegistry } = require('../utils/xmlRegistry');
const logger = require('../config/logger');

const getInspectorsSchema = (req, res) => {
  try {
    const objectsList = xmlRegistry.getAvailableObjects();
    const properties = {};
    const plurals = {};

    objectsList.forEach(obj => {
      properties[obj] = xmlRegistry.getPropertiesFor(obj);
      plurals[obj] = xmlRegistry.getPluralName(obj);
    });

    res.json({ objectsList, properties, plurals });
  } catch (error) {
    logger.error(`Inspector schema error: ${error.message}`);
    res.status(500).json({ error: 'Failed to load inspector schema.' });
  }
};

module.exports = { getInspectorsSchema };

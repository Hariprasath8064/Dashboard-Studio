const express = require('express');
const router = express.Router();

const relevanceController = require('../controllers/relevanceController');
const dashboardController = require('../controllers/dashboardController');
const datasetController   = require('../controllers/datasetController');
const inspectorController = require('../controllers/inspectorController');

// ── BigFix / Relevance ──────────────────────────────────────
router.post('/evaluate', relevanceController.evaluateQuery);
router.post('/wizard-properties', relevanceController.getWizardProperties);
router.get('/sites', relevanceController.getSites);
router.post('/query-structured', relevanceController.executeStructuredQuery);
router.post('/query-preview', relevanceController.previewStructuredQuery);
router.get('/schema/:objectType', relevanceController.getSchema);
router.get('/inspectors', inspectorController.getInspectorsSchema);

// ── Dashboards ──────────────────────────────────────────────
router.get('/dashboards', dashboardController.listDashboards);
router.post('/dashboards', dashboardController.createDashboard);
router.get('/dashboards/:id', dashboardController.getDashboard);
router.put('/dashboards/:id', dashboardController.updateDashboard);
router.delete('/dashboards/:id', dashboardController.deleteDashboard);

// ── Datasets ────────────────────────────────────────────────
router.get('/datasets', datasetController.listDatasets);
router.post('/datasets', datasetController.saveDataset);
router.get('/datasets/:id', datasetController.getDataset);
router.delete('/datasets/:id', datasetController.deleteDataset);

module.exports = router;

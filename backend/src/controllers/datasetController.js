const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.listDatasets = (req, res) => {
  db.all(
    `SELECT id, name, row_count, col_count, created_at, updated_at FROM datasets ORDER BY updated_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
};

exports.getDataset = (req, res) => {
  db.get(`SELECT * FROM datasets WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
};

exports.saveDataset = (req, res) => {
  const { name, row_count, col_count, data } = req.body;
  if (!name || !data) return res.status(400).json({ error: 'name and data are required' });

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO datasets (id, name, row_count, col_count, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, row_count || 0, col_count || 0, data, now, now],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, name, row_count, col_count, created_at: now, updated_at: now });
    }
  );
};

exports.deleteDataset = (req, res) => {
  db.run(`DELETE FROM datasets WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
};

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.listDashboards = (req, res) => {
  db.all(`
    SELECT d.id, d.name, d.dataset_id, ds.name as dataset_name, d.created_at, d.updated_at
    FROM dashboards d
    LEFT JOIN datasets ds ON ds.id = d.dataset_id
    ORDER BY d.updated_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
};

exports.getDashboard = (req, res) => {
  db.get(
    `SELECT id, name, dataset_id, canvas_json, created_at, updated_at FROM dashboards WHERE id = ?`,
    [req.params.id],
    (err, d) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!d) return res.status(404).json({ error: 'Not found' });

      if (d.dataset_id) {
        db.get(`SELECT data FROM datasets WHERE id = ?`, [d.dataset_id], (err2, ds) => {
          if (ds) d.dataset = ds.data;
          res.json(d);
        });
      } else {
        res.json(d);
      }
    }
  );
};

exports.createDashboard = (req, res) => {
  const { name, dataset_id, canvas_json } = req.body;
  if (!name || !canvas_json) return res.status(400).json({ error: 'name and canvas_json are required' });

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO dashboards (id, name, dataset_id, canvas_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, dataset_id || null, canvas_json, now, now],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, name, dataset_id, created_at: now, updated_at: now });
    }
  );
};

exports.updateDashboard = (req, res) => {
  const { name, dataset_id, canvas_json } = req.body;
  if (!name || !canvas_json) return res.status(400).json({ error: 'name and canvas_json are required' });

  const now = new Date().toISOString();

  db.run(
    `UPDATE dashboards SET name=?, dataset_id=?, canvas_json=?, updated_at=? WHERE id=?`,
    [name, dataset_id || null, canvas_json, now, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ id: req.params.id, updated_at: now });
    }
  );
};

exports.deleteDashboard = (req, res) => {
  db.run(`DELETE FROM dashboards WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  });
};

const db = require('../db'); // uses backend/db/index.js -> pg helper

// List complaints. If ?jenis=... provided, filter by jenis.
exports.listComplaints = async (req, res) => {
  try {
    const { jenis } = req.query;
    if (jenis) {
      const q = 'SELECT id, name, email, jenis, complaint, file_url AS "fileUrl", status, created_at FROM complaints WHERE jenis = $1 ORDER BY created_at DESC';
      const r = await db.query(q, [jenis]);
      return res.json(r.rows);
    }
    const q = 'SELECT id, name, email, jenis, complaint, file_url AS "fileUrl", status, created_at FROM complaints ORDER BY created_at DESC';
    const r = await db.query(q);
    res.json(r.rows);
  } catch (err) {
    console.error('listComplaints error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComplaint = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const q = 'SELECT id, name, email, jenis, complaint, file_url AS "fileUrl", status, created_at FROM complaints WHERE id = $1';
    const r = await db.query(q, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('getComplaint error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    // support both JSON body and multipart/form-data (multer)
    const name = req.body.name || '';
    const email = req.body.email || '';
    const jenis = req.body.jenis || '';
    const complaintText = req.body.complaint || req.body.description || '';
    if (!name || !email || !jenis || !complaintText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const q = `INSERT INTO complaints (name, email, jenis, complaint, file_url, status)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, jenis, complaint, file_url AS "fileUrl", status, created_at`;
    const values = [name, email, jenis, complaintText, fileUrl || null, 'Baru'];
    const r = await db.query(q, values);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('createComplaint error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    const q = 'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING id, name, email, jenis, complaint, file_url AS "fileUrl", status, created_at';
    const r = await db.query(q, [status, id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('updateStatus error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

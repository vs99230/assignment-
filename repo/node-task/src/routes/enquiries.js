const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const { validateEnquiry } = require('../validators');

const router = express.Router();

const COLUMNS = 'id, name, email, phone, course_interest, message, claimed_by, claimed_at, created_at';

// POST /api/enquiries  (PUBLIC - no auth)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { errors, value } = validateEnquiry(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const { rows } = await pool.query(
      `INSERT INTO enquiries (name, email, phone, course_interest, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
      [value.name, value.email, value.phone, value.course_interest, value.message]
    );
    res.status(201).json({ success: true, message: 'Enquiry submitted', data: rows[0] });
  })
);

// GET /api/enquiries/unclaimed  (public enquiries visible to all employees)
router.get(
  '/unclaimed',
  auth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM enquiries WHERE claimed_by IS NULL ORDER BY created_at DESC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  })
);

// GET /api/enquiries/mine  (leads claimed by the logged-in employee)
router.get(
  '/mine',
  auth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM enquiries WHERE claimed_by = $1 ORDER BY claimed_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, count: rows.length, data: rows });
  })
);

// POST /api/enquiries/:id/claim  (atomic: only one employee can win)
router.post(
  '/:id/claim',
  auth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid enquiry id' });
    }

    const { rows } = await pool.query(
      `UPDATE enquiries SET claimed_by = $1, claimed_at = NOW()
       WHERE id = $2 AND claimed_by IS NULL
       RETURNING ${COLUMNS}`,
      [req.user.id, id]
    );
    if (rows.length) {
      return res.json({ success: true, message: 'Enquiry claimed', data: rows[0] });
    }

    const exists = await pool.query('SELECT claimed_by FROM enquiries WHERE id = $1', [id]);
    if (!exists.rows.length) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    return res.status(409).json({ success: false, message: 'Enquiry already claimed' });
  })
);

module.exports = router;

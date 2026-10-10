const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { asyncHandler } = require('../middleware/errors');
const { validateRegister, validateLogin } = require('../validators');

const router = express.Router();

const signToken = (employee) =>
  jwt.sign({ id: employee.id, email: employee.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { errors, value } = validateRegister(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const hash = await bcrypt.hash(value.password, 10);
    try {
      const { rows } = await pool.query(
        `INSERT INTO employees (name, email, password_hash)
         VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
        [value.name, value.email, hash]
      );
      const employee = rows[0];
      return res.status(201).json({ success: true, data: { employee, token: signToken(employee) } });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      throw err;
    }
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { errors, value } = validateLogin(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash FROM employees WHERE email = $1',
      [value.email]
    );
    const employee = rows[0];
    const ok = employee && (await bcrypt.compare(value.password, employee.password_hash));
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    delete employee.password_hash;
    return res.json({ success: true, data: { employee, token: signToken(employee) } });
  })
);

module.exports = router;

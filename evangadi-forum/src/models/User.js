const pool = require('../config/db');

const User = {
  async create({ username, firstname, lastname, email, passwordHash }) {
    const [result] = await pool.execute(
      `INSERT INTO users (username, firstname, lastname, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [username, firstname, lastname, email, passwordHash]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT user_id, username, firstname, lastname, email, password_hash,
              created_at, updated_at
       FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(userId) {
    const [rows] = await pool.execute(
      `SELECT user_id, username, firstname, lastname, email, created_at, updated_at
       FROM users WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.execute(
      `SELECT user_id FROM users WHERE username = ?`,
      [username]
    );
    return rows[0] || null;
  },
};

module.exports = User;

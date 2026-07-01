const pool = require('../config/db');

const Question = {
  async create({ questionid, userid, title, description, tag }) {
    const [result] = await pool.execute(
      `INSERT INTO questions (questionid, userid, title, description, tag)
       VALUES (?, ?, ?, ?, ?)`,
      [questionid, userid, title, description, tag || null]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT q.id, q.questionid, q.userid, q.title, q.description, q.tag,
              q.created_at, q.updated_at,
              u.username, u.firstname, u.lastname
       FROM questions q
       JOIN users u ON q.userid = u.user_id
       ORDER BY q.created_at DESC`
    );
    return rows;
  },

  async findByQuestionId(questionid) {
    const [rows] = await pool.execute(
      `SELECT q.id, q.questionid, q.userid, q.title, q.description, q.tag,
              q.created_at, q.updated_at,
              u.username, u.firstname, u.lastname
       FROM questions q
       JOIN users u ON q.userid = u.user_id
       WHERE q.questionid = ?`,
      [questionid]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, questionid, userid, title, description, tag, created_at, updated_at
       FROM questions WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async update(questionid, { title, description, tag }) {
    const [result] = await pool.execute(
      `UPDATE questions
       SET title = ?, description = ?, tag = ?
       WHERE questionid = ?`,
      [title, description, tag || null, questionid]
    );
    return result.affectedRows > 0;
  },

  async delete(questionid) {
    const [result] = await pool.execute(
      `DELETE FROM questions WHERE questionid = ?`,
      [questionid]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Question;

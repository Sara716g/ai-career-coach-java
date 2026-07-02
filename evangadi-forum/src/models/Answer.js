const pool = require('../config/db');

const Answer = {
  async create({ userid, questionid, answer }) {
    const [result] = await pool.execute(
      `INSERT INTO answers (userid, questionid, answer)
       VALUES (?, ?, ?)`,
      [userid, questionid, answer]
    );
    return result.insertId;
  },

  async findByQuestionId(questionDbId) {
    const [rows] = await pool.execute(
      `SELECT a.answerid, a.userid, a.questionid, a.answer,
              a.created_at, a.updated_at,
              u.username, u.firstname, u.lastname
       FROM answers a
       JOIN users u ON a.userid = u.user_id
       WHERE a.questionid = ?
       ORDER BY a.created_at ASC`,
      [questionDbId]
    );
    return rows;
  },

  async findById(answerid) {
    const [rows] = await pool.execute(
      `SELECT answerid, userid, questionid, answer, created_at, updated_at
       FROM answers WHERE answerid = ?`,
      [answerid]
    );
    return rows[0] || null;
  },

  async update(answerid, answer) {
    const [result] = await pool.execute(
      `UPDATE answers SET answer = ? WHERE answerid = ?`,
      [answer, answerid]
    );
    return result.affectedRows > 0;
  },

  async delete(answerid) {
    const [result] = await pool.execute(
      `DELETE FROM answers WHERE answerid = ?`,
      [answerid]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Answer;

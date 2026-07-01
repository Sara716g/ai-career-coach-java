const Question = require('../models/Question');
const Answer = require('../models/Answer');

async function createAnswer(req, res, next) {
  try {
    const { questionid } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    const question = await Question.findByQuestionId(questionid);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answerid = await Answer.create({
      userid: req.user.userId,
      questionid: question.id,
      answer: answer.trim(),
    });

    const created = await Answer.findById(answerid);

    res.status(201).json({
      message: 'Answer posted successfully',
      answer: created,
    });
  } catch (err) {
    next(err);
  }
}

async function updateAnswer(req, res, next) {
  try {
    const { answerid } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Answer text is required' });
    }

    const existing = await Answer.findById(answerid);
    if (!existing) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (existing.userid !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own answers' });
    }

    await Answer.update(answerid, answer.trim());
    const updated = await Answer.findById(answerid);

    res.json({
      message: 'Answer updated successfully',
      answer: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAnswer(req, res, next) {
  try {
    const { answerid } = req.params;

    const existing = await Answer.findById(answerid);
    if (!existing) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (existing.userid !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own answers' });
    }

    await Answer.delete(answerid);

    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAnswer, updateAnswer, deleteAnswer };

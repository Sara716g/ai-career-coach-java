const { nanoid } = require('nanoid');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

async function getAllQuestions(req, res, next) {
  try {
    const questions = await Question.findAll();
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const { questionid } = req.params;
    const question = await Question.findByQuestionId(questionid);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.findByQuestionId(question.id);

    res.json({ question, answers });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const { title, description, tag } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }

    if (tag && tag.length > 20) {
      return res.status(400).json({ message: 'Tag must be 20 characters or less' });
    }

    const questionid = nanoid(12);
    const id = await Question.create({
      questionid,
      userid: req.user.userId,
      title,
      description,
      tag,
    });

    const question = await Question.findById(id);

    res.status(201).json({
      message: 'Question created successfully',
      question,
    });
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { questionid } = req.params;
    const { title, description, tag } = req.body;

    const existing = await Question.findByQuestionId(questionid);
    if (!existing) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (existing.userid !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own questions' });
    }

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    await Question.update(questionid, { title, description, tag });
    const question = await Question.findByQuestionId(questionid);

    res.json({
      message: 'Question updated successfully',
      question,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const { questionid } = req.params;

    const existing = await Question.findByQuestionId(questionid);
    if (!existing) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (existing.userid !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own questions' });
    }

    await Question.delete(questionid);

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

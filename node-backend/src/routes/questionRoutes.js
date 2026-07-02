const express = require('express');
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', questionController.getAllQuestions);
router.get('/:questionid', questionController.getQuestionById);
router.post('/', authenticate, questionController.createQuestion);
router.put('/:questionid', authenticate, questionController.updateQuestion);
router.delete('/:questionid', authenticate, questionController.deleteQuestion);

module.exports = router;

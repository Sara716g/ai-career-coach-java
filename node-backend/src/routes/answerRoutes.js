const express = require('express');
const answerController = require('../controllers/answerController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:questionid', authenticate, answerController.createAnswer);
router.put('/:answerid', authenticate, answerController.updateAnswer);
router.delete('/:answerid', authenticate, answerController.deleteAnswer);

module.exports = router;

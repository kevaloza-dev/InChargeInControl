const express = require('express');
const { getActiveQuiz, submitQuiz, getQuizHistory } = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/active', getActiveQuiz);
router.post('/submit', submitQuiz);
router.get('/history', getQuizHistory);

module.exports = router;

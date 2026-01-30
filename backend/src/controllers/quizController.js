const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get active quiz for today
const getActiveQuiz = async (req, res) => {
  try {
    // Get start of today in UTC
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // Current UTC date YYYY-MM-DD
    const startOfToday = new Date(`${datePart}T00:00:00.000Z`);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const quiz = await Quiz.findOne({ 
      status: 'ACTIVE', 
      activeDate: { $gte: startOfToday, $lt: endOfToday } 
    });

    if (!quiz) {
      return res.status(404).json({ error: 'No active quiz for today' });
    }

    // Check if user already attempted
    const attempt = await QuizAttempt.findOne({ userId: req.user.id, quizId: quiz._id });
    
    // Convert to plain object to allow modification
    const quizObj = quiz.toObject();

    // Helper to shuffle options
    const shuffleOptions = (questions) => {
      if (!questions || !Array.isArray(questions)) return;
      questions.forEach(q => {
        if (!q.options) return;
        for (let i = q.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
        }
      });
    };

    // Shuffle top-level questions (Legacy)
    if (quizObj.questions) shuffleOptions(quizObj.questions);

    // Shuffle multi-language content
    if (quizObj.content) {
      // If content is a Mongoose Map, Object.keys won't work on the map itself
      // but quiz.toObject() usually converts it. Let's be safe.
      const contentObj = (quizObj.content instanceof Map) 
        ? Object.fromEntries(quizObj.content) 
        : quizObj.content;

      Object.keys(contentObj).forEach(lang => {
        if (contentObj[lang] && contentObj[lang].questions) {
          shuffleOptions(contentObj[lang].questions);
        }
      });
    }

    // Return quiz and attempt data
    res.json({
      quiz: quiz.toJSON({ flattenMaps: true }),
      alreadyAttempted: !!attempt,
      attempt: attempt || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Submit quiz responses
const submitQuiz = async (req, res) => {
  const { quizId, responses, language } = req.body;
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Enforce one attempt
    const existingAttempt = await QuizAttempt.findOne({ userId: req.user.id, quizId });
    if (existingAttempt) return res.status(403).json({ error: 'Already attempted' });

    let inCharge = 0;
    let inControl = 0;

    responses.forEach(resp => {
      if (resp.answerType === 'In-Charge') inCharge++;
      else if (resp.answerType === 'In-Control') inControl++;
    });

    let result = 'Balanced';
    if (inCharge > 5) result = 'In-Charge';
    else if (inControl > 5) result = 'In-Control';

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId,
      responses,
      score: { inCharge, inControl },
      result,
      language: language || 'english'
    });

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
};

// Get all quiz attempts for the logged-in user
const getQuizHistory = async (req, res) => {
  try {
    const history = await QuizAttempt.find({ userId: req.user.id })
      .populate('quizId', 'content title activeDate')
      .sort({ completedAt: -1 });

    const formattedHistory = history.map(attempt => {
      // Find the title from content Map or legacy title
      let quizTitle = 'Untitled Quiz';
      if (attempt.quizId) {
        if (attempt.quizId.content) {
          // Just grab the first available language title
          const langKeys = Array.from(attempt.quizId.content.keys());
          if (langKeys.length > 0) {
            quizTitle = attempt.quizId.content.get(langKeys[0]).title;
          }
        } else if (attempt.quizId.title) {
          quizTitle = attempt.quizId.title;
        }
      }

      return {
        _id: attempt._id,
        quizId: attempt.quizId?._id,
        quizTitle,
        date: attempt.completedAt,
        result: attempt.result,
        score: attempt.score,
        responses: attempt.responses,
        language: attempt.language,
        // Include quiz questions for detailed view if needed
        quizContent: attempt.quizId?.content || null,
        quizQuestions: attempt.quizId?.questions || []
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error('Error fetching quiz history:', err);
    res.status(500).json({ error: 'Server error fetching history' });
  }
};

module.exports = { getActiveQuiz, submitQuiz, getQuizHistory };

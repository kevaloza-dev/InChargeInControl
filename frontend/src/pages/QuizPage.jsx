import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ladder from '../components/Ladder';
import QuizHistory from '../components/QuizHistory';
import QuizResultView from '../components/QuizResultView';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, History } from 'lucide-react';

const QuizPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(5); 
  const [responses, setResponses] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  // New states for History
  const [view, setView] = useState('quiz'); // 'quiz', 'history', 'result'
  const [history, setHistory] = useState([]);
  const [selectedHistoryQuiz, setSelectedHistoryQuiz] = useState(null);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const languageLabels = {
    english: 'English',
    hindi: 'Hindi',
    gujarati: 'Gujarati',
    malayalam: 'Malayalam'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Parallel fetch today's quiz and history
      const [quizRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/quiz/active').catch(err => ({ status: 404 })),
        axios.get('http://localhost:5000/api/quiz/history').catch(err => ({ data: [] }))
      ]);

      setHistory(historyRes.data || []);

      if (quizRes.status === 200) {
        const { quiz: quizData, alreadyAttempted, attempt } = quizRes.data;
        setQuiz(quizData);

        if (alreadyAttempted) {
          setResult(attempt);
          setResponses(attempt.responses);
          setCompleted(true);
          setView('history'); // Redirect to history instead of result view
          if (quizData.languages && quizData.languages.length > 0) {
            setSelectedLang(quizData.languages[0]);
          }
          calculateStep(attempt.responses);
        } else {
            setView('quiz');
            if (quizData.languages && quizData.languages.length === 1) {
              setSelectedLang(quizData.languages[0]);
            } else if (!quizData.languages) {
              setSelectedLang('english');
            }
        }
      } else {
        // No quiz for today, auto-open history
        setView('history');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/quiz/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const calculateStep = (responses) => {
    let step = 5;
    responses.forEach(r => {
      if (r.answerType === 'In-Charge') step = Math.min(step + 1, 10);
      else step = Math.max(step - 1, 1);
    });
    setCurrentStep(step);
  };

  const handleAnswer = (answerType) => {
    const questions = quiz.content?.[selectedLang]?.questions || quiz.questions;
    const newResponses = [...responses, { 
      questionId: questions[currentQuestionIndex]._id, 
      answerType 
    }];
    setResponses(newResponses);

    if (answerType === 'In-Charge') {
      setCurrentStep(prev => Math.min(prev + 1, 10));
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz(newResponses);
    }
  };

  const submitQuiz = async (finalResponses) => {
    try {
      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        quizId: quiz._id,
        responses: finalResponses,
        language: selectedLang
      });
      setResult(res.data);
      setCompleted(true);
      setView('result');
      fetchHistory(); // Refresh history after submission
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  const handleSelectHistoryQuiz = (attempt) => {
    setSelectedHistoryQuiz(attempt);
    setShowDetails(true); // Directly show detailed results
    setView('history-detail');
  };

  const renderNavbar = () => (
    <header className="px-10 py-5 flex justify-between items-center border-b border-glass-border bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-40">
      <h2 className="text-xl font-bold text-accent-primary uppercase tracking-widest cursor-pointer" onClick={() => {
          if (completed) setView('result');
          else if (quiz) setView('quiz');
          else setView('history');
      }}>
        In-Charge OR In-Control
      </h2>
      <div className="flex items-center gap-2 md:gap-5">
        <span className="text-text-secondary hidden lg:inline">Welcome, {user?.name}</span>
        
        <button 
          onClick={() => setView('history')} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${view === 'history' || view === 'history-detail' ? 'bg-accent-primary/20 text-accent-primary' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
        >
          <History size={18} /> <span className="hidden sm:inline">Quiz History</span>
        </button>

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <UserCircle size={18} /> <span className="hidden sm:inline">Profile</span>
        </button>
        
        <button onClick={handleLogout} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
          <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center text-text-secondary animate-pulse">Loading Your Journey...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-bg-primary">
       <div className="glass-card p-10 text-center max-w-md">
         <p className="text-error mb-6 text-lg font-medium">{error}</p>
         <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
       </div>
    </div>
  );

  // Language Selection Screen
  if (view === 'quiz' && !selectedLang && quiz?.languages?.length > 1) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        {renderNavbar()}
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center max-w-2xl w-full"
          >
            <h1 className="text-4xl font-bold mb-4">Choose Your Language</h1>
            <p className="text-text-secondary mb-10">Select a language to start the daily quiz</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quiz.languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-accent-primary/10 hover:border-accent-primary/50 transition-all text-xl font-semibold active:scale-[0.98]"
                >
                  {languageLabels[lang] || lang}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {renderNavbar()}
      
      <main className="flex-1 p-5 md:p-10 flex flex-col items-center max-w-7xl mx-auto w-full">
        
        {view === 'history' && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="w-full"
            >
                <QuizHistory history={history} onSelectQuiz={handleSelectHistoryQuiz} />
            </motion.div>
        )}

        {view === 'history-detail' && selectedHistoryQuiz && (
            <div className="w-full flex flex-col items-center">
                <div className="w-full flex justify-start mb-6">
                    <button 
                        onClick={() => setView('history')}
                        className="text-accent-primary hover:underline flex items-center gap-2"
                    >
                         &larr; Back to History
                    </button>
                </div>
                <QuizResultView 
                    result={{ result: selectedHistoryQuiz.result }}
                    responses={selectedHistoryQuiz.responses}
                    quizData={{ 
                        content: selectedHistoryQuiz.quizContent,
                        questions: selectedHistoryQuiz.quizQuestions
                    }}
                    selectedLang={selectedHistoryQuiz.language || Object.keys(selectedHistoryQuiz.quizContent || {})[0] || 'english'}
                    showDetails={showDetails}
                    setShowDetails={setShowDetails}
                    hideToggle={true}
                    currentStep={(() => {
                        let step = 5;
                        selectedHistoryQuiz.responses.forEach(r => {
                            if (r.answerType === 'In-Charge') step = Math.min(step + 1, 10);
                            else step = Math.max(step - 1, 1);
                        });
                        return step;
                    })()}
                />
            </div>
        )}

        {view === 'result' && result && (
            <QuizResultView 
                result={result}
                responses={responses}
                quizData={quiz}
                selectedLang={selectedLang}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
                currentStep={currentStep}
            />
        )}

        {view === 'quiz' && quiz && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-center mt-4">
                <div className="flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {(() => {
                            const questions = quiz.content?.[selectedLang]?.questions || quiz.questions;
                            const currentQuestion = questions[currentQuestionIndex];
                            return (
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card p-8 md:p-12 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-secondary" />
                                    <p className="text-accent-primary font-bold mb-4 tracking-wider text-sm uppercase">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </p>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">{currentQuestion.questionText}</h2>
                                    <div className="flex flex-col gap-4">
                                        {currentQuestion.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                className="group p-5 rounded-xl border border-glass-border bg-bg-secondary/50 text-left hover:border-accent-primary/10 hover:border-accent-primary/50 transition-all duration-200 active:scale-[0.99]"
                                                onClick={() => handleAnswer(option.type)}
                                            >
                                                <span className="font-medium text-lg text-text-primary group-hover:text-white transition-colors">{option.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>
                </div>

                <div className="hidden lg:flex flex-col items-center bg-bg-secondary/30 rounded-3xl p-8 border border-glass-border h-[600px]">
                    <h3 className="text-lg font-bold mb-8 text-text-secondary">Your Progress</h3>
                    <div className="flex-1 w-full flex justify-center">
                        <Ladder currentStep={currentStep} />
                    </div>
                </div>
            </div>
        )}

        {view === 'quiz' && !quiz && (
             <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold mb-4">No Quiz for Today</h2>
                <p className="text-text-secondary mb-8">Come back tomorrow for a new challenge!</p>
                <button onClick={() => setView('history')} className="btn-primary">View My History</button>
             </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;


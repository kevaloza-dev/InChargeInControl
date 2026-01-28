import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Save, X, Trash2, Plus } from 'lucide-react';

const QuizEditor = ({ quiz, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        activeDate: quiz.activeDate ? new Date(quiz.activeDate).toISOString().split('T')[0] : '',
        questions: quiz.questions || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        activeDate: '',
        questions: Array.from({ length: 10 }, (_, i) => createEmptyQuestion(i))
      });
    }
  }, [quiz]);

  const createEmptyQuestion = (index) => ({
    questionText: `Question ${index + 1}`,
    options: [
      { text: '', type: 'In-Charge' },
      { text: '', type: 'In-Control' },
      { text: '', type: 'In-Control' },
      { text: '', type: 'In-Control' }
    ]
  });

  const handleGenerateAI = async () => {
    if (readOnly) return;
    if (!window.confirm("This will overwrite current content with AI generated draft. Continue?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/quizzes/generate-ai');
      const newQuiz = res.data;
      setFormData({
        title: newQuiz.title,
        description: newQuiz.description,
        questions: newQuiz.questions
      });
      alert('AI Quiz Generated! You can now review and edit.');
    } catch (err) {
      setError("AI Generation failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    if (readOnly) return;
    const updated = [...formData.questions];
    updated[idx][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleOptionChange = (qIdx, oIdx, field, value) => {
    if (readOnly) return;
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[qIdx].options];
    updatedOptions[oIdx][field] = value;
    updatedQuestions[qIdx].options = updatedOptions;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) {
        onCancel();
        return;
    }
    setError(null);

    // Basic Client validation logic
    if (formData.questions.length !== 10) {
      setError("Must have exactly 10 questions.");
      return;
    }

    try {
      setLoading(true);
      if (quiz) {
        // Update
        await axios.put(`http://localhost:5000/api/admin/quizzes/${quiz._id}`, formData);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/admin/quizzes', formData);
      }
      onSave(); // Close editor
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{readOnly ? 'View Quiz' : (quiz ? 'Edit Quiz' : 'Create New Quiz')}</h2>
        {!quiz && !readOnly && (
          <button 
            type="button" 
            onClick={handleGenerateAI} 
            className="btn-secondary bg-gradient-to-br from-indigo-500 to-purple-500 border-none text-white hover:opacity-90"
            disabled={loading}
          >
            <Sparkles size={18} />
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-error rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={readOnly} className="border-none p-0 m-0 disabled:opacity-80">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">Quiz Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              disabled={readOnly}
              className="input-base text-lg font-semibold"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="2"
              disabled={readOnly}
              className="input-base resize-y min-h-[80px]"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-text-secondary mb-2">Active Date (Optional)</label>
            <input 
              type="date" 
              value={formData.activeDate} 
              onChange={(e) => setFormData({...formData, activeDate: e.target.value})}
              disabled={readOnly}
              className="input-base max-w-xs"
            />
            {!readOnly && (
              <p className="text-xs text-text-secondary mt-2">
                Setting a date here plans the quiz but does not activate it. Use the 'Activate' button in the list to go live.
              </p>
            )}
          </div>

          <h3 className="text-xl font-bold mb-4">Questions (10 Required)</h3>
          <div className="flex flex-col gap-6">
            {formData.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08]">
                <div className="flex gap-4 mb-4">
                  <span className="pt-3 font-bold text-accent-primary">Q{qIdx + 1}.</span>
                  <input 
                    type="text" 
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                    placeholder="Enter question text..."
                    required
                    disabled={readOnly}
                    className="input-base flex-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-10">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex flex-col gap-2">
                      <input 
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, 'text', e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        required
                        disabled={readOnly}
                        className="input-base text-sm"
                      />
                      <select 
                        value={opt.type}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, 'type', e.target.value)}
                        disabled={readOnly}
                        className="input-base text-xs py-2 h-auto cursor-pointer focus:ring-1 focus:ring-accent-primary"
                      >
                        <option value="In-Charge" className="bg-bg-secondary">In-Charge</option>
                        <option value="In-Control" className="bg-bg-secondary">In-Control</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex gap-4 justify-end">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-text-secondary/30 text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          
          {!readOnly && (
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Quiz'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizEditor;

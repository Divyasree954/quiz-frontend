import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['Technology', 'Science', 'History', 'Mathematics', 'Geography', 'Sports', 'Entertainment', 'General Knowledge'];
const emptyQuestion = () => ({
  questionText: '',
  options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
  explanation: '',
  points: 1
});

export default function QuizForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', description: '', category: 'General Knowledge',
    difficulty: 'Medium', timeLimit: 30, isPublished: false, questions: [emptyQuestion()]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeQ, setActiveQ] = useState(0);

  useEffect(() => {
    if (isEdit) fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      setForm(data.quiz);
    } catch (err) {
      setError('Failed to load quiz');
    }
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateQuestion = (qIdx, field, value) => {
    const qs = [...form.questions];
    qs[qIdx] = { ...qs[qIdx], [field]: value };
    setForm(prev => ({ ...prev, questions: qs }));
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    const qs = [...form.questions];
    const opts = [...qs[qIdx].options];
    if (field === 'isCorrect') {
      // Only one correct per question
      opts.forEach((o, i) => opts[i] = { ...o, isCorrect: i === oIdx });
    } else {
      opts[oIdx] = { ...opts[oIdx], [field]: value };
    }
    qs[qIdx] = { ...qs[qIdx], options: opts };
    setForm(prev => ({ ...prev, questions: qs }));
  };

  const addQuestion = () => {
    setForm(prev => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
    setActiveQ(form.questions.length);
  };

  const removeQuestion = (idx) => {
    if (form.questions.length === 1) return;
    const qs = form.questions.filter((_, i) => i !== idx);
    setForm(prev => ({ ...prev, questions: qs }));
    setActiveQ(Math.max(0, idx - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.questionText.trim()) return setError(`Question ${i + 1} needs a question text`);
      if (q.options.some(o => !o.text.trim())) return setError(`All options in question ${i + 1} must have text`);
      if (!q.options.some(o => o.isCorrect)) return setError(`Question ${i + 1} needs a correct answer`);
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/quizzes/${id}`, form);
      } else {
        await api.post('/quizzes', form);
      }
      navigate('/my-quizzes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        <p className="page-subtitle">Build your quiz with multiple choice questions</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Quiz Info */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.25rem' }}>Quiz Details</h2>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-input" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Enter quiz title" required />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Describe what this quiz covers..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => updateForm('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={e => updateForm('difficulty', e.target.value)}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Time Limit (minutes)</label>
              <input type="number" className="form-input" value={form.timeLimit} onChange={e => updateForm('timeLimit', Number(e.target.value))} min={1} max={180} />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.isPublished ? 'published' : 'draft'} onChange={e => updateForm('isPublished', e.target.value === 'published')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Q Navigator */}
          <div style={{ width: '140px', flexShrink: 0 }}>
            <div className="card" style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Questions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {form.questions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveQ(i)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: i === activeQ ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: i === activeQ ? 'white' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    Q{i + 1} {q.options.some(o => o.isCorrect) ? '✓' : ''}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }} onClick={addQuestion}>
                + Add Q
              </button>
            </div>
          </div>

          {/* Active question editor */}
          {form.questions[activeQ] && (
            <div className="card" style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Question {activeQ + 1}</h3>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(activeQ)}>Remove</button>
              </div>

              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  value={form.questions[activeQ].questionText}
                  onChange={e => updateQuestion(activeQ, 'questionText', e.target.value)}
                  placeholder="Enter your question..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                  <label className="form-label">Points</label>
                  <input type="number" className="form-input" value={form.questions[activeQ].points} onChange={e => updateQuestion(activeQ, 'points', Number(e.target.value))} min={1} />
                </div>
              </div>

              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Answer Options * (select correct answer)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {form.questions[activeQ].options.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={`correct-${activeQ}`}
                      checked={opt.isCorrect}
                      onChange={() => updateOption(activeQ, oIdx, 'isCorrect', true)}
                      title="Mark as correct"
                      style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', width: '20px' }}>{String.fromCharCode(65 + oIdx)}</span>
                    <input
                      type="text"
                      className="form-input"
                      value={opt.text}
                      onChange={e => updateOption(activeQ, oIdx, 'text', e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Explanation (optional)</label>
                <input type="text" className="form-input" value={form.questions[activeQ].explanation} onChange={e => updateQuestion(activeQ, 'explanation', e.target.value)} placeholder="Explain the correct answer..." />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/my-quizzes')}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? '💾 Update Quiz' : '🚀 Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

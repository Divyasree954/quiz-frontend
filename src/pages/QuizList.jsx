import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = ['All', 'Technology', 'Science', 'History', 'Mathematics', 'Geography', 'Sports', 'Entertainment', 'General Knowledge'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty, search]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (search) params.search = search;
      const { data } = await api.get('/quizzes', { params });
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Browse Quizzes</h1>
          <p className="page-subtitle">Find and take quizzes on any topic</p>
        </div>
        <input
          type="text"
          className="form-input"
          placeholder="Search quizzes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {DIFFICULTIES.map(diff => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`btn btn-sm ${selectedDifficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
          >
            {diff}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No quizzes found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <Link key={quiz._id} to={`/quiz/${quiz._id}`} className="quiz-card">
              <div>
                <div className="quiz-card-tags" style={{ marginBottom: '0.75rem' }}>
                  <span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>{quiz.difficulty}</span>
                  <span className="badge badge-category">{quiz.category}</span>
                </div>
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p className="quiz-card-desc" style={{ marginTop: '0.5rem' }}>{quiz.description || 'No description provided.'}</p>
              </div>
              <div className="quiz-card-footer">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className="quiz-meta-item">❓ {quiz.questions?.length || 0} questions</span>
                  <span className="quiz-meta-item">⏱️ {quiz.timeLimit} min</span>
                  <span className="quiz-meta-item">👤 {quiz.createdBy?.username}</span>
                </div>
                <span className="btn btn-primary btn-sm">Take Quiz →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function QuizDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${id}`);
      setQuiz(data.quiz);
      setTimeLeft(data.quiz.timeLimit * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setStarted(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectAnswer = (optionIndex) => {
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const answersArray = quiz.questions.map((_, i) => answers[i] !== undefined ? answers[i] : null);
      const { data } = await api.post('/results/submit', {
        quizId: quiz._id,
        answers: answersArray,
        timeTaken
      });
      navigate(`/result/${data.result._id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!quiz) return <div className="page-container"><p>Quiz not found.</p></div>;

  if (!started) {
    return (
      <div className="page-container" style={{ maxWidth: '700px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{quiz.description}</p>

          <div className="stats-grid" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
            <div className="stat-card">
              <div className="stat-value">{quiz.questions?.length}</div>
              <div className="stat-label">Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{quiz.timeLimit}m</div>
              <div className="stat-label">Time Limit</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{quiz.totalAttempts}</div>
              <div className="stat-label">Attempts</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>{quiz.difficulty}</span>
            <span className="badge badge-category">{quiz.category}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>By {quiz.createdBy?.username}</span>
          </div>

          {user ? (
            <button onClick={startQuiz} className="btn btn-primary btn-lg">Start Quiz ⚡</button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg">Login to Take Quiz</Link>
          )}
        </div>

        {/* Leaderboard */}
        <LeaderboardSection quizId={quiz._id} />
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const answered = Object.keys(answers).length;

  return (
    <div className="page-container" style={{ maxWidth: '750px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          Question {currentQ + 1} / {quiz.questions.length}
        </span>
        <div style={{
          background: timeLeft < 60 ? 'rgba(239,68,68,0.15)' : 'var(--bg-card)',
          color: timeLeft < 60 ? 'var(--accent-danger)' : 'var(--text-primary)',
          border: `1px solid ${timeLeft < 60 ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem'
        }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="quiz-question">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4 }}>
          {question.questionText}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${answers[currentQ] === idx ? 'selected' : ''}`}
              onClick={() => selectAnswer(idx)}
            >
              <span className="option-label">{String.fromCharCode(65 + idx)}</span>
              {option.text}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {answered} / {quiz.questions.length} answered
        </span>

        {currentQ < quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>
            Next →
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz ✓'}
          </button>
        )}
      </div>

      {/* Question navigator */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: `2px solid ${i === currentQ ? 'var(--accent-primary)' : answers[i] !== undefined ? 'var(--accent-success)' : 'var(--border-color)'}`,
              background: i === currentQ ? 'var(--accent-primary)' : answers[i] !== undefined ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function LeaderboardSection({ quizId }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get(`/results/leaderboard/${quizId}`)
      .then(({ data }) => setLeaderboard(data.leaderboard))
      .catch(() => {});
  }, [quizId]);

  if (!leaderboard.length) return null;

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem' }}>🏆 Top Scores</h3>
      {leaderboard.map((r, i) => (
        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: i < 3 ? 'var(--accent-warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
            #{i + 1} {r.user?.username}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{r.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

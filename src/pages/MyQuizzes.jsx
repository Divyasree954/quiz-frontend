import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes/my');
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    setDeleting(id);
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await api.patch(`/quizzes/${id}/publish`);
      setQuizzes(quizzes.map(q => q._id === id ? data.quiz : q));
    } catch (err) {
      alert('Failed to update publish status');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Quizzes</h1>
          <p className="page-subtitle">Manage your created quizzes</p>
        </div>
        <Link to="/quiz/create" className="btn btn-primary">+ Create New Quiz</Link>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value">{quizzes.length}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quizzes.filter(q => q.isPublished).length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quizzes.reduce((s, q) => s + (q.totalAttempts || 0), 0)}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0)}</div>
          <div className="stat-label">Total Questions</div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ marginBottom: '1.5rem' }}>You haven't created any quizzes yet.</p>
          <Link to="/quiz/create" className="btn btn-primary">Create Your First Quiz</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Questions</th>
                <th>Attempts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td>
                    <Link to={`/quiz/${quiz._id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                      {quiz.title}
                    </Link>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>⏱️ {quiz.timeLimit} min</div>
                  </td>
                  <td><span className="badge badge-category">{quiz.category}</span></td>
                  <td><span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>{quiz.difficulty}</span></td>
                  <td style={{ fontWeight: 600 }}>{quiz.questions?.length || 0}</td>
                  <td style={{ fontWeight: 600 }}>{quiz.totalAttempts || 0}</td>
                  <td>
                    <span className={`badge badge-${quiz.isPublished ? 'published' : 'draft'}`}>
                      {quiz.isPublished ? '✓ Published' : '◦ Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/quiz/${quiz._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button
                        onClick={() => handleTogglePublish(quiz._id)}
                        className={`btn btn-sm ${quiz.isPublished ? 'btn-secondary' : 'btn-success'}`}
                      >
                        {quiz.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="btn btn-danger btn-sm"
                        disabled={deleting === quiz._id}
                      >
                        {deleting === quiz._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

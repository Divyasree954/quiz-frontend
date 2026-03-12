import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my')
      .then(({ data }) => setResults(data.results))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length) : 0;
  const best = results.length ? Math.max(...results.map(r => r.percentage)) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Results</h1>
        <p className="page-subtitle">Your quiz history and performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{results.length}</div><div className="stat-label">Quizzes Taken</div></div>
        <div className="stat-card"><div className="stat-value">{avg}%</div><div className="stat-label">Average Score</div></div>
        <div className="stat-card"><div className="stat-value">{best}%</div><div className="stat-label">Best Score</div></div>
        <div className="stat-card"><div className="stat-value">{results.filter(r => r.percentage >= 70).length}</div><div className="stat-label">Passed</div></div>
      </div>

      {results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p style={{ marginBottom: '1.5rem' }}>You haven't taken any quizzes yet.</p>
          <Link to="/quizzes" className="btn btn-primary">Browse Quizzes</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Category</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Time</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result._id}>
                  <td style={{ fontWeight: 600 }}>{result.quiz?.title || 'Deleted Quiz'}</td>
                  <td>
                    {result.quiz?.category && <span className="badge badge-category">{result.quiz.category}</span>}
                  </td>
                  <td style={{ fontWeight: 700 }}>{result.score}/{result.totalPoints}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="progress-bar" style={{ width: '80px' }}>
                        <div className="progress-fill" style={{ width: `${result.percentage}%` }} />
                      </div>
                      <span style={{
                        fontWeight: 700,
                        color: result.percentage >= 70 ? 'var(--accent-success)' : result.percentage >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                      }}>
                        {result.percentage}%
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {result.timeTaken ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : '-'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(result.completedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/result/${result._id}`} className="btn btn-secondary btn-sm">View</Link>
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

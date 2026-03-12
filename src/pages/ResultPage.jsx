import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(({ data }) => setResult(data.result))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!result) return <div className="page-container"><p>Result not found.</p></div>;

  const { score, totalPoints, percentage, quiz, answers, timeTaken } = result;
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';
  const gradeColor = percentage >= 70 ? 'var(--accent-success)' : percentage >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)';

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {quiz?.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Quiz Completed!</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: gradeColor, lineHeight: 1 }}>
              {grade}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Grade</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: gradeColor, lineHeight: 1 }}>
              {percentage}%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Score</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {score}/{totalPoints}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Points</div>
          </div>
          {timeTaken && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Time</div>
            </div>
          )}
        </div>

        <div className="progress-bar" style={{ maxWidth: '300px', margin: '0 auto 2rem', height: '12px' }}>
          <div className="progress-fill" style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor})` }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to={`/quiz/${quiz?._id}`} className="btn btn-secondary">Try Again</Link>
          <Link to="/quizzes" className="btn btn-primary">Browse More Quizzes</Link>
        </div>
      </div>

      {/* Answer Review */}
      {quiz?.questions && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '1rem' }}>Answer Review</h2>
          {quiz.questions.map((question, idx) => {
            const ans = answers[idx];
            const correctIdx = question.options.findIndex(o => o.isCorrect);
            return (
              <div key={idx} className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Question {idx + 1}</span>
                  <span style={{ fontWeight: 700, color: ans?.isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {ans?.isCorrect ? '✓ Correct' : '✗ Incorrect'} · {ans?.pointsEarned || 0}/{question.points} pts
                  </span>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{question.questionText}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {question.options.map((opt, oIdx) => {
                    const isSelected = ans?.selectedOption === oIdx;
                    const isCorrect = opt.isCorrect;
                    let className = 'option-btn';
                    if (isCorrect) className += ' correct';
                    else if (isSelected && !isCorrect) className += ' wrong';
                    return (
                      <div key={oIdx} className={className} style={{ cursor: 'default' }}>
                        <span className="option-label">{String.fromCharCode(65 + oIdx)}</span>
                        {opt.text}
                        {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>✓ Correct</span>}
                        {isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>Your answer</span>}
                      </div>
                    );
                  })}
                </div>
                {question.explanation && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>💡 Explanation: </strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{question.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import './FeedbackForm.css'; // CSS 파일 임포트 (선택 사항)

function FeedbackForm({ apiUrl, onFeedbackSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [goodPoints, setGoodPoints] = useState('');
  const [badPoints, setBadPoints] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 최소 하나는 입력되었는지 클라이언트 측에서도 확인 (서버에서도 확인하지만 UX 향상)
    if (goodPoints.trim().length === 0 && badPoints.trim().length === 0) {
        setError('잘한 점 또는 아쉬운 점 중 하나는 입력해주세요.');
        return;
    }

    setIsSubmitting(true);
    setError(null);

    const newFeedback = { date, goodPoints, badPoints };

    try {
      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // 입력 필드 초기화
      setGoodPoints('');
      setBadPoints('');

      if (onFeedbackSaved) {
        onFeedbackSaved(); // 부모에게 저장 완료 알림
      }

    } catch (err) {
      console.error('피드백 저장 실패:', err);
      setError(err.message || '피드백 저장 중 오류 발생');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form">
      <h2>피드백 및 교훈 정리</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="feedback-date">날짜:</label>
          <input type="date" id="feedback-date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isSubmitting} />
        </div>
        <div>
          <label htmlFor="good-points">잘한 점 (Good):</label>
          <textarea id="good-points" value={goodPoints} onChange={(e) => setGoodPoints(e.target.value)} rows="4" placeholder="이번 주/오늘 잘했던 점들을 적어보세요." disabled={isSubmitting} />
        </div>
        <div>
          <label htmlFor="bad-points">아쉬운 점 / 교훈 (Learned):</label>
          <textarea id="bad-points" value={badPoints} onChange={(e) => setBadPoints(e.target.value)} rows="4" placeholder="아쉬웠던 점이나 이를 통해 배운 점을 적어보세요." disabled={isSubmitting} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '피드백 저장'}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;
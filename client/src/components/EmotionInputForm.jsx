import React, { useState } from 'react';
import './EmotionInputForm.css';

function EmotionInputForm({ apiUrl, onEmotionSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState(5);
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const newEmotion = {
      date,
      score: parseInt(score, 10),
      memo,
    };

    // console.log('Submitting Emotion:', newEmotion); // 전송 전 확인

    try {
      // --- 실제 API 호출 로직 ---
      const response = await fetch(`${apiUrl}/emotions`, { // props로 받은 apiUrl 사용
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmotion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // console.log('Emotion saved:', await response.json()); // 성공 응답 확인 (선택)

      // 입력 필드 초기화 (선택 사항)
      setScore(5); // 점수만 초기화하거나
      setMemo('');   // 메모만 초기화할 수도 있음

      // 부모 컴포넌트에 저장 완료 알림 -> 목록 새로고침
      if (onEmotionSaved) {
        onEmotionSaved();
      }

    } catch (err) {
      console.error('감정 데이터 저장 실패:', err);
      setError(err.message || '감정 데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="emotion-input-form">
      <h2>감정 기록하기</h2>
      <form onSubmit={handleSubmit}>
        {/* Input fields (기존과 동일) */}
         <div>
          <label htmlFor="emotion-date">날짜:</label>
          <input type="date" id="emotion-date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="emotion-score">감정 점수 (1-10):</label>
          <input type="range" id="emotion-score" min="1" max="10" value={score} onChange={(e) => setScore(e.target.value)} required disabled={isSubmitting}/>
          <span> {score}점</span>
        </div>
        <div>
          <label htmlFor="emotion-memo">간단 메모:</label>
          <textarea id="emotion-memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="오늘 느꼈던 감정에 대해 간단히 적어보세요." rows="3" disabled={isSubmitting}/>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '감정 기록 저장'}
        </button>
      </form>
    </div>
  );
}

export default EmotionInputForm;
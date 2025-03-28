import React, { useState } from 'react';
import './EmotionInputForm.css'; // CSS 파일 임포트 (선택 사항)

function EmotionInputForm({ apiUrl, onEmotionSaved }) { // 나중에 API 연동을 위해 props 추가
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState(5); // 감정 점수 (1-10), 중간값 5 기본
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const newEmotion = {
      date,
      score: parseInt(score, 10), // 숫자로 변환
      memo,
    };

    console.log('Submitting Emotion:', newEmotion); // 제출 데이터 확인용 (임시)

    // TODO: 백엔드 API로 감정 데이터 전송 로직 추가 (Issue #7에서 구현)
    try {
      // 임시로 성공 처리 (나중에 fetch API 호출로 대체)
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 딜레이
      console.log('Emotion data submitted (simulated)');

      // 입력 필드 초기화 (선택 사항)
      setScore(5);
      setMemo('');

      // 부모 컴포넌트에 알림 (목록 새로고침 등)
      if (onEmotionSaved) {
        onEmotionSaved(); // 아직 onEmotionSaved는 App.jsx에 정의되지 않음
      }

    } catch (err) {
      console.error('감정 데이터 저장 실패 (시뮬레이션):', err);
      setError('감정 데이터 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="emotion-input-form">
      <h2>감정 기록하기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="emotion-date">날짜:</label>
          <input
            type="date"
            id="emotion-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label htmlFor="emotion-score">감정 점수 (1-10):</label>
          <input
            type="range"
            id="emotion-score"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <span> {score}점</span> {/* 현재 점수 표시 */}
        </div>
        <div>
          <label htmlFor="emotion-memo">간단 메모:</label>
          <textarea
            id="emotion-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="오늘 느꼈던 감정에 대해 간단히 적어보세요."
            rows="3"
            disabled={isSubmitting}
          />
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
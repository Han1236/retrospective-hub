import React, { useState } from 'react'; // useState 임포트
import './EmotionList.css';

// API URL은 App.jsx에서 props로 받아오는 것이 더 좋지만,
// 편의상 여기 직접 정의 (나중에 리팩토링 가능)
const API_URL = 'http://localhost:3001/api';

function EmotionList({ emotions }) {
  // --- 상태 추가 ---
  // 요약 결과를 저장할 상태 (객체: { emotionId: summaryText })
  const [summaryMap, setSummaryMap] = useState({});
  // 각 항목별 로딩 상태 (객체: { emotionId: true/false })
  const [loadingMap, setLoadingMap] = useState({});
  // 각 항목별 에러 상태 (객체: { emotionId: errorMessage })
  const [errorMap, setErrorMap] = useState({});

  // --- 요약 버튼 클릭 핸들러 ---
  const handleSummarizeClick = async (emotionId, memo) => {
    if (!memo) {
      setErrorMap(prev => ({ ...prev, [emotionId]: '요약할 메모가 없습니다.' }));
      return;
    }

    // 이미 요약 결과가 있거나 로딩 중이면 다시 호출하지 않음 (선택적)
    if (summaryMap[emotionId] || loadingMap[emotionId]) {
      return;
    }

    // 로딩 시작 및 이전 에러 초기화
    setLoadingMap(prev => ({ ...prev, [emotionId]: true }));
    setErrorMap(prev => ({ ...prev, [emotionId]: null }));

    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textToSummarize: memo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // 요약 결과 저장
      setSummaryMap(prev => ({ ...prev, [emotionId]: result.summary }));

    } catch (err) {
      console.error('요약 실패:', err);
      setErrorMap(prev => ({ ...prev, [emotionId]: err.message || '요약 중 오류 발생' }));
    } finally {
      // 로딩 종료
      setLoadingMap(prev => ({ ...prev, [emotionId]: false }));
    }
  };


  if (!emotions || emotions.length === 0) {
    return <p>기록된 감정이 없습니다.</p>;
  }

  return (
    <div className="emotion-list">
      <h2>감정 기록 목록</h2>
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>점수</th>
            <th>메모 / 요약</th> {/* 헤더 변경 */}
            <th>액션</th> {/* 버튼 열 추가 */}
          </tr>
        </thead>
        <tbody>
          {emotions.map((emotion) => (
            <tr key={emotion.id}>
              <td>{emotion.date}</td>
              <td>{emotion.score}</td>
              <td>
                {/* 원본 메모 */}
                <div style={{ marginBottom: '5px' }}>{emotion.memo || '-'}</div>
                {/* 요약 결과 표시 영역 */}
                {loadingMap[emotion.id] && <small style={{ color: 'gray' }}>요약 중...</small>}
                {errorMap[emotion.id] && <small style={{ color: 'red' }}>오류: {errorMap[emotion.id]}</small>}
                {summaryMap[emotion.id] && (
                  <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px' }}>
                    <strong>AI 요약:</strong> {summaryMap[emotion.id]}
                  </div>
                )}
              </td>
              <td>
                {/* 요약 보기 버튼 */}
                {emotion.memo && ( // 메모가 있을 때만 버튼 표시
                  <button
                    onClick={() => handleSummarizeClick(emotion.id, emotion.memo)}
                    disabled={loadingMap[emotion.id] || !!summaryMap[emotion.id]} // 로딩 중이거나 이미 요약했으면 비활성화
                  >
                    {loadingMap[emotion.id] ? '요약중' : (summaryMap[emotion.id] ? '요약됨' : 'AI 요약 보기')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmotionList;
import React from 'react';
import './EmotionList.css'; // CSS 파일 임포트 (선택 사항)

function EmotionList({ emotions }) { // props로 감정 데이터 배열을 받음
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
            <th>점수 (1-10)</th>
            <th>메모</th>
            {/* <th>기록 시간</th> */}
          </tr>
        </thead>
        <tbody>
          {emotions.map((emotion) => (
            <tr key={emotion.id}> {/* 고유 key 값으로 emotion.id 사용 */}
              <td>{emotion.date}</td>
              <td>{emotion.score}</td>
              <td>{emotion.memo}</td>
              {/* <td>{new Date(emotion.createdAt).toLocaleString()}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmotionList;
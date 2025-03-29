import React from 'react';
import './FeedbackList.css'; // CSS 파일 임포트 (선택 사항)

function FeedbackList({ feedbackItems }) {
  if (!feedbackItems || feedbackItems.length === 0) {
    return <p>기록된 피드백/교훈이 없습니다.</p>;
  }

  // 텍스트 줄바꿈을 위한 간단한 함수
  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="feedback-list">
      <h2>피드백/교훈 목록</h2>
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>잘한 점 (Good)</th>
            <th>아쉬운 점 / 교훈 (Learned)</th>
          </tr>
        </thead>
        <tbody>
          {feedbackItems.map((item) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.goodPoints ? formatText(item.goodPoints) : '-'}</td>
              <td>{item.badPoints ? formatText(item.badPoints) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FeedbackList;
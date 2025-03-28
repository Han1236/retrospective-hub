import React, { useState } from 'react';
import './DataInputForm.css'; // CSS 파일 임포트 (선택 사항)

function DataInputForm() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // 오늘 날짜 기본값
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // 폼 기본 제출 동작 방지
    // 입력된 데이터 확인 (일단 콘솔에 출력)
    console.log({
      date,
      name: itemName,
      value: parseFloat(itemValue), // 숫자로 변환
    });

    // TODO: 백엔드 API로 데이터 전송 로직 추가 (다음 단계에서 구현)

    // 입력 필드 초기화 (선택 사항)
    // setItemName('');
    // setItemValue('');
  };

  return (
    <div className="data-input-form">
      <h2>데이터 기록하기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">날짜:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="itemName">항목:</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="예: 이력서 지원 횟수"
            required
          />
        </div>
        <div>
          <label htmlFor="itemValue">값:</label>
          <input
            type="number"
            id="itemValue"
            value={itemValue}
            onChange={(e) => setItemValue(e.target.value)}
            placeholder="예: 3"
            required
          />
        </div>
        <button type="submit">기록 저장</button>
      </form>
    </div>
  );
}

export default DataInputForm;
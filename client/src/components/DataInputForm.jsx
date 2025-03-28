import React, { useState } from 'react';
import './DataInputForm.css';

// App.jsx에서 apiUrl과 onDataSaved 함수를 props로 받음
function DataInputForm({ apiUrl, onDataSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태
  const [error, setError] = useState(null); // 에러 상태

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true); // 제출 시작
    setError(null); // 에러 초기화

    const newData = {
      date,
      name: itemName,
      value: parseFloat(itemValue),
    };

    // console.log('Submitting:', newData); // 전송 데이터 확인용

    try {
      const response = await fetch(`${apiUrl}/data`, { // props로 받은 apiUrl 사용
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        // 서버에서 에러 응답을 보낸 경우 (e.g., 400 Bad Request)
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // const savedData = await response.json(); // 저장된 데이터 확인 (선택 사항)
      // console.log('Data saved:', savedData);

      // 입력 필드 초기화
      // setItemName(''); // 사용성 고려: 유지할 수도 있음
      setItemValue(''); // 값만 초기화하는 것이 더 나을 수 있음

      // 부모 컴포넌트에 데이터 저장 완료 알림 (목록 새로고침 요청)
      if (onDataSaved) {
        onDataSaved();
      }

    } catch (err) {
      console.error('데이터 저장 실패:', err);
      setError(err.message || '데이터 저장 중 오류가 발생했습니다.'); // 사용자에게 보여줄 에러 메시지 설정
    } finally {
      setIsSubmitting(false); // 제출 종료 (성공/실패 여부와 관계없이)
    }
  };

  return (
    <div className="data-input-form">
      <h2>데이터 기록하기</h2>
      <form onSubmit={handleSubmit}>
        {/* Input fields (기존과 동일) */}
        <div>
          <label htmlFor="date">날짜:</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="itemName">항목:</label>
          <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="예: 이력서 지원 횟수" required disabled={isSubmitting}/>
        </div>
        <div>
          <label htmlFor="itemValue">값:</label>
          <input type="number" id="itemValue" value={itemValue} onChange={(e) => setItemValue(e.target.value)} placeholder="예: 3" required disabled={isSubmitting}/>
        </div>

        {/* 에러 메시지 표시 */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '기록 저장'}
        </button>
      </form>
    </div>
  );
}

export default DataInputForm;
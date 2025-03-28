// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import DataInputForm from './components/DataInputForm'; // 컴포넌트 임포트

function App() {
  const [message, setMessage] = useState('');

  // 백엔드 API 테스트용 (기존 코드 유지 또는 수정)
  useEffect(() => {
    fetch('http://localhost:3001/api') // 백엔드 주소 확인
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API 호출 오류:", err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
        <p>서버 메시지: {message || "로딩 중..."}</p> {/* 서버 연결 확인용 */}
      </header>
      <main>
        <DataInputForm /> {/* 데이터 입력 폼 렌더링 */}
        {/* 여기에 나중에 데이터 목록, 감정 입력 폼 등이 추가될 예정 */}
      </main>
    </div>
  );
}

export default App;
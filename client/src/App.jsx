import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import DataInputForm from './components/DataInputForm';
import DataList from './components/DataList'; // DataList 컴포넌트 임포트

const API_URL = 'http://localhost:3001/api'; // API 기본 주소

function App() {
  // const [message, setMessage] = useState(''); // 서버 메시지 확인용 (이제 필요 없을 수 있음)
  const [dataList, setDataList] = useState([]); // 데이터 목록 상태
  const [error, setError] = useState(null); // 에러 상태 추가

  // 데이터 가져오는 함수 (useCallback으로 불필요한 재생성 방지)
  const fetchData = useCallback(async () => {
    setError(null); // 에러 초기화
    try {
      const response = await fetch(`${API_URL}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDataList(data);
    } catch (err) {
      console.error("데이터 가져오기 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다."); // 사용자에게 보여줄 에러 메시지 설정
    }
  }, []); // 의존성 배열 비움 (API_URL이 변경되지 않는 한)

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchData();
    /* // 서버 메시지 확인용 (이제 필요 없을 수 있음)
    fetch(`${API_URL}`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API 호출 오류:", err));
    */
  }, [fetchData]); // fetchData가 변경될 때만 실행 (useCallback 사용 시 사실상 마운트 시 1회)

  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
        {/* <p>서버 메시지: {message || "로딩 중..."}</p> */}
      </header>
      <main>
        {/* 데이터 입력 폼에 fetchData 함수를 props로 전달 */}
        <DataInputForm onDataSaved={fetchData} apiUrl={API_URL} />

        {/* 에러 메시지 표시 */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* 데이터 목록 컴포넌트 렌더링 */}
        <DataList data={dataList} />
      </main>
    </div>
  );
}

export default App;
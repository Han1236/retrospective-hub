// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // 기본 App 스타일
import DataInputForm from './components/DataInputForm';   // 수치 데이터 입력 폼
import DataList from './components/DataList';           // 수치 데이터 목록
import EmotionInputForm from './components/EmotionInputForm'; // 감정 입력 폼 (이번에 추가)

// 백엔드 API의 기본 URL
const API_URL = 'http://localhost:3001/api';

function App() {
  // --- 상태 관리 ---
  const [dataList, setDataList] = useState([]);       // 수치 데이터 목록 상태
  const [emotionList, setEmotionList] = useState([]); // 감정 데이터 목록 상태 (다음 단계에서 사용)
  const [error, setError] = useState(null);           // 공통 에러 메시지 상태
  // const [message, setMessage] = useState(''); // 초기 서버 연결 확인용 (이제 주석 처리하거나 제거해도 무방)

  // --- 데이터 가져오기 함수 ---

  // 수치 데이터 가져오는 함수
  const fetchData = useCallback(async () => {
    setError(null); // 이전 에러 초기화
    try {
      const response = await fetch(`${API_URL}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDataList(data);
    } catch (err) {
      console.error("수치 데이터 가져오기 실패:", err);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, []); // API_URL은 변하지 않으므로 의존성 배열 비움

  // 감정 데이터 가져오는 함수 (아직 API 없음, 다음 단계에서 구현)
  const fetchEmotions = useCallback(async () => {
    // setError(null); // 에러 초기화는 필요시 추가
    console.log("Fetching emotions..."); // 임시 로그
    try {
      // TODO: Issue #8에서 감정 데이터 가져오는 API 호출 로직 구현
      // const response = await fetch(`${API_URL}/emotions`);
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const emotions = await response.json();
      // setEmotionList(emotions);
    } catch (err) {
      console.error("감정 데이터 가져오기 실패:", err);
      setError("감정 데이터를 불러오는 중 오류가 발생했습니다."); // 공통 에러 상태 사용 또는 별도 상태 관리
    }
  }, []); // 의존성 배열 비움

  // --- 컴포넌트 마운트 시 초기 데이터 로딩 ---
  useEffect(() => {
    fetchData();      // 수치 데이터 로드
    fetchEmotions();  // 감정 데이터 로드 (현재는 콘솔 로그만)

    /* // 초기 서버 연결 확인용 (이제 필요 없을 수 있음)
    fetch(`${API_URL}`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("API 연결 확인 오류:", err));
    */
  }, [fetchData, fetchEmotions]); // fetchData, fetchEmotions 함수가 재생성될 때만 재실행 (useCallback으로 인해 사실상 마운트 시 1회)

  // --- 콜백 함수 ---

  // 감정 데이터 저장 완료 시 호출될 함수 (EmotionInputForm에서 호출)
  const handleEmotionSaved = () => {
    console.log("App.jsx: Emotion saved callback triggered!");
    fetchEmotions(); // 감정 목록 새로고침 시도 (아직 fetchEmotions 내용은 없음)
  }

  // --- JSX 렌더링 ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
        {/* <p>서버 메시지: {message || "로딩 중..."}</p> */}
      </header>
      <main>
        {/* 수치 데이터 입력 폼 */}
        <DataInputForm
          apiUrl={API_URL}
          onDataSaved={fetchData} // 데이터 저장 성공 시 fetchData 호출하여 목록 새로고침
        />

        {/* 감정 입력 폼 (이번에 추가) */}
        <EmotionInputForm
          apiUrl={API_URL}
          onEmotionSaved={handleEmotionSaved} // 감정 저장 성공 시 handleEmotionSaved 호출
        />

        {/* 에러 메시지 표시 */}
        {error && <p className="error-message" style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

        {/* 수치 데이터 목록 */}
        <DataList data={dataList} />

        {/* 감정 데이터 목록 (다음 단계에서 추가될 위치) */}
        {/* <EmotionList emotions={emotionList} /> */}
      </main>
    </div>
  );
}

export default App;
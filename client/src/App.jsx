// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // 기본 App 스타일
import DataInputForm from './components/DataInputForm';   // 수치 데이터 입력 폼
import DataList from './components/DataList';           // 수치 데이터 목록
import EmotionInputForm from './components/EmotionInputForm'; // 감정 입력 폼
import EmotionList from './components/EmotionList'; // EmotionList 임포트

// 백엔드 API의 기본 URL
const API_URL = 'http://localhost:3001/api';

function App() {
  // --- 상태 관리 ---
  const [dataList, setDataList] = useState([]);       // 수치 데이터 목록 상태
  const [emotionList, setEmotionList] = useState([]); // 감정 데이터 목록 상태 
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

  // 감정 데이터 가져오기 함수 구현
  const fetchEmotions = useCallback(async () => {
    // setError(null); // 필요시 에러 초기화 위치 조정
    try {
      const response = await fetch(`${API_URL}/emotions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const emotions = await response.json();
      setEmotionList(emotions); // 상태 업데이트
    } catch (err) {
      console.error("감정 데이터 가져오기 실패:", err);
      // 여러 API 호출 중 에러 발생 시 어떻게 처리할지 고려 필요
      // 여기서는 마지막 에러만 표시되거나, 별도 에러 상태 관리
      setError("감정 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, []); // 의존성 배열 비움

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    fetchData();
    fetchEmotions(); // 구현된 함수 호출
  }, [fetchData, fetchEmotions]);

  // --- 콜백 함수 ---

  // 감정 저장 완료 시 콜백
  const handleEmotionSaved = () => {
    console.log("App.jsx: Emotion saved callback triggered!");
    fetchEmotions(); // 감정 목록 새로고침
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
      </header>
      <main>
        <DataInputForm apiUrl={API_URL} onDataSaved={fetchData} />
        <EmotionInputForm apiUrl={API_URL} onEmotionSaved={handleEmotionSaved} />

        {error && <p className="error-message" style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

        <DataList data={dataList} />
        <EmotionList emotions={emotionList} /> {/* 감정 목록 렌더링 */}
      </main>
    </div>
  );
}

export default App;
// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import DataInputForm from './components/DataInputForm';
import DataList from './components/DataList';
import EmotionInputForm from './components/EmotionInputForm';
import EmotionList from './components/EmotionList';
import FeedbackForm from './components/FeedbackForm';   // FeedbackForm 임포트
import FeedbackList from './components/FeedbackList';   // FeedbackList 임포트

const API_URL = 'http://localhost:3001/api';

function App() {
  // --- 상태 관리 ---
  const [dataList, setDataList] = useState([]);
  const [emotionList, setEmotionList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]); // 피드백 목록 상태 추가
  const [error, setError] = useState(null);

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
  }, []);

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
      setError("감정 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  // 피드백 데이터 가져오기 함수 추가
  const fetchFeedback = useCallback(async () => {
    // setError(null); // 에러 처리 정책에 따라 조정
    try {
      const response = await fetch(`${API_URL}/feedback`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const feedback = await response.json();
      setFeedbackList(feedback); // 상태 업데이트
    } catch (err) {
      console.error("피드백 데이터 가져오기 실패:", err);
      setError("피드백 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, []);

  // --- 컴포넌트 마운트 시 초기 데이터 로딩 ---
  useEffect(() => {
    fetchData();
    fetchEmotions();
    fetchFeedback(); // 피드백 데이터 로딩 호출 추가
  }, [fetchData, fetchEmotions, fetchFeedback]); // 의존성 배열에 추가

  // --- 콜백 함수 ---

  // 감정 저장 완료 시 콜백
  const handleEmotionSaved = () => {
    console.log("App.jsx: Emotion saved callback triggered!");
    fetchEmotions(); // 감정 목록 새로고침
  };

  // 피드백 저장 완료 시 콜백 함수 (올바른 위치)
  const handleFeedbackSaved = () => {
    console.log("App.jsx: Feedback saved callback triggered!");
    fetchFeedback(); // 피드백 목록 새로고침
  };

  // --- JSX 렌더링 (하나의 return 문) ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
      </header>
      <main>
        {/* 입력 폼들 */}
        <DataInputForm apiUrl={API_URL} onDataSaved={fetchData} />
        <EmotionInputForm apiUrl={API_URL} onEmotionSaved={handleEmotionSaved} />
        {/* 피드백 입력 폼 추가 */}
        <FeedbackForm apiUrl={API_URL} onFeedbackSaved={handleFeedbackSaved} />

        {/* 에러 메시지 표시 */}
        {error && <p className="error-message" style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

        {/* 목록들 */}
        <DataList data={dataList} />
        <EmotionList emotions={emotionList} />
        {/* 피드백 목록 추가 */}
        <FeedbackList feedbackItems={feedbackList} />
      </main>
    </div>
  );
} // App 함수의 끝

export default App;
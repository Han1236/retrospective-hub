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

  // --- 계획 추천 관련 상태 추가 ---
  const [recommendations, setRecommendations] = useState([]); // 추천 계획 목록
  const [isRecommendLoading, setIsRecommendLoading] = useState(false); // 추천 로딩 상태
  const [recommendError, setRecommendError] = useState(null); // 추천 기능 에러 상태

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

  // --- 다음 주 계획 추천 요청 함수 추가 ---
  const handleRecommendPlan = useCallback(async () => {
    setIsRecommendLoading(true);
    setRecommendError(null);
    setRecommendations([]); // 이전 추천 내용 초기화

    try {
      // 가장 최근 피드백과 감정 메모 찾기 (배열이 최신순 정렬 가정)
      const latestFeedback = feedbackList[0];
      const latestEmotion = emotionList[0];

      const requestBody = {
        recentBadPoints: latestFeedback?.badPoints || null, // 없으면 null 또는 빈 문자열
        recentEmotionMemo: latestEmotion?.memo || null,    // 없으면 null 또는 빈 문자열
      };

      // 분석할 데이터가 하나라도 있는지 확인
      if (!requestBody.recentBadPoints && !requestBody.recentEmotionMemo) {
        throw new Error("추천을 위한 최근 회고 데이터(아쉬운 점 또는 감정 메모)가 없습니다.");
      }

      const response = await fetch(`${API_URL}/recommend-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []); // 추천 결과 업데이트

    } catch (err) {
      console.error("AI 계획 추천 요청 실패:", err);
      setRecommendError(err.message || "계획 추천을 받아오는 중 오류가 발생했습니다.");
    } finally {
      setIsRecommendLoading(false); // 로딩 종료
    }
  }, [feedbackList, emotionList]); // feedbackList, emotionList가 변경될 때 함수 재생성

  // --- JSX 렌더링 ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>회고 허브 (Retrospective Hub)</h1>
      </header>
      <main>
        {/* --- 입력 폼 섹션 --- */}
        <section className="input-section">
          <DataInputForm apiUrl={API_URL} onDataSaved={fetchData} />
          <EmotionInputForm apiUrl={API_URL} onEmotionSaved={handleEmotionSaved} />
          <FeedbackForm apiUrl={API_URL} onFeedbackSaved={handleFeedbackSaved} />
        </section>

        {/* --- 에러 메시지 표시 (공통) --- */}
        {error && <p className="error-message fetch-error">{error}</p>}

        {/* --- 목록 섹션 --- */}
        <section className="list-section">
          <DataList data={dataList} />
          <EmotionList emotions={emotionList} />
          <FeedbackList feedbackItems={feedbackList} />
        </section>

        {/* --- AI 계획 추천 섹션 추가 --- */}
        <section className="recommendation-section">
          <h2>✨ 다음 주 계획 추천 (AI)</h2>
          <button
            onClick={handleRecommendPlan}
            disabled={isRecommendLoading}
            className="recommend-button"
          >
            {isRecommendLoading ? '추천 생성 중...' : 'AI 추천 받기'}
          </button>

          {/* 추천 로딩 및 에러 메시지 */}
          {isRecommendLoading && <p>AI가 열심히 다음 주 계획을 생각하고 있어요...</p>}
          {recommendError && <p className="error-message recommend-error">{recommendError}</p>}

          {/* 추천 결과 표시 */}
          {recommendations.length > 0 && (
            <div className="recommendations-list">
              <h3>AI 추천 활동:</h3>
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
// server/server.js
require('dotenv').config(); // .env 파일 로드 (코드 맨 위)
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Google AI SDK 임포트

// --- Google AI 클라이언트 설정 ---
if (!process.env.GEMINI_API_KEY) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('Google Gemini API Key not found in .env file');
  console.error('Please create a server/.env file and add GEMINI_API_KEY');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // process.exit(1); // 실제 서비스에서는 종료 권장
}
// API 키를 사용하여 Generative AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- 데이터 저장을 위한 임시 메모리 DB ---
let dataStore = []; // 데이터를 저장할 배열
let emotionStore = []; // 감정 데이터를 저장할 배열 추가
let feedbackStore = []; // 피드백 데이터를 저장할 배열 추가

// 기본 라우트 (테스트용)
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// --- 데이터 저장 API 엔드포인트 ---
app.post('/api/data', (req, res) => {
  try {
    const { date, name, value } = req.body;

    // 간단한 유효성 검사
    if (!date || !name || value === undefined || value === null) {
      return res.status(400).json({ message: 'Missing required fields (date, name, value)' });
    }

    // 숫자 타입 확인 (더 엄격하게 하려면 typeof value === 'number' 등 추가)
    if (isNaN(parseFloat(value))) {
        return res.status(400).json({ message: 'Value must be a number' });
    }

    // 새 데이터 객체 생성 (고유 ID 포함)
    const newData = {
      id: uuidv4(), // 고유 ID 생성
      date,
      name,
      value: parseFloat(value), // 숫자로 변환하여 저장
      createdAt: new Date().toISOString(), // 생성 시각 기록 (선택 사항)
    };

    // 데이터 저장 (배열에 추가)
    dataStore.push(newData);

    console.log('Data saved:', newData);
    console.log('Current dataStore:', dataStore); // 저장 상태 확인용 로그

    // 클라이언트에 성공 응답 전송 (저장된 데이터 포함)
    res.status(201).json({ message: 'Data saved successfully', data: newData });

  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- 데이터 조회 API 엔드포인트 ---
app.get('/api/data', (req, res) => {
    try {
      // 현재 dataStore에 있는 모든 데이터를 반환
      // 나중에는 여기서 날짜별 정렬 등을 추가할 수 있습니다.
      // 최신 데이터가 위로 오도록 정렬 (선택 사항)
      const sortedData = [...dataStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      res.status(200).json(sortedData); // 또는 정렬하지 않으려면 res.status(200).json(dataStore);
  
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// --- 감정 데이터 저장 API 엔드포인트 (새로 추가) ---
app.post('/api/emotions', (req, res) => {
    try {
      const { date, score, memo } = req.body;
  
      // 유효성 검사
      if (!date || score === undefined || score === null) {
        return res.status(400).json({ message: 'Missing required fields (date, score)' });
      }
      const scoreNum = parseInt(score, 10);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
        return res.status(400).json({ message: 'Score must be a number between 1 and 10' });
      }
      // 메모는 선택 사항이므로 필수는 아님 (길이 제한 등은 필요시 추가)
  
      // 새 감정 데이터 객체 생성
      const newEmotion = {
        id: uuidv4(), // 고유 ID
        date,
        score: scoreNum,
        memo: memo || '', // 메모가 없으면 빈 문자열로 저장
        createdAt: new Date().toISOString(),
      };
  
      // 데이터 저장 (배열에 추가)
      emotionStore.push(newEmotion);
  
      console.log('Emotion saved:', newEmotion);
      console.log('Current emotionStore:', emotionStore); // 저장 상태 확인용 로그
  
      // 클라이언트에 성공 응답 전송
      res.status(201).json({ message: 'Emotion saved successfully', data: newEmotion });
  
    } catch (error) {
      console.error('Error saving emotion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// --- 감정 데이터 조회 API 엔드포인트 (새로 추가) ---
app.get('/api/emotions', (req, res) => {
    try {
      // 최신 데이터가 위로 오도록 정렬
      const sortedEmotions = [...emotionStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      res.status(200).json(sortedEmotions);
  
    } catch (error) {
      console.error('Error fetching emotions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// --- AI 요약 API 엔드포인트 (Gemini 사용) ---
app.post('/api/summarize', async (req, res) => {
    try {
      const { textToSummarize } = req.body;
  
      if (!textToSummarize || typeof textToSummarize !== 'string' || textToSummarize.trim().length === 0) {
        return res.status(400).json({ message: '텍스트를 입력해주세요.' });
      }
  
      // 길이 제한 (Gemini 모델의 입력 제한 및 비용 고려)
      if (textToSummarize.length > 1500) { // 예: 1500자 (모델별 제한 확인 필요)
          return res.status(400).json({ message: '요약할 텍스트가 너무 깁니다. (1500자 이하)' });
      }
  
      console.log('요청 받은 텍스트:', textToSummarize);
  
      // --- Google Gemini API 호출 ---
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
      // 프롬프트 구성 (Gemini는 보통 직접적인 지시문을 선호)
      const prompt = `다음 회고 내용을 한국어로 간결하게 요약해줘:\n\n"${textToSummarize}"\n\n핵심 내용과 감정 위주로 1~2문장으로 요약해줘.`;
  
      // 생성 설정 (선택 사항)
      const generationConfig = {
        temperature: 0.5, // 창의성 조절 (0 ~ 1)
        maxOutputTokens: 150, // 최대 출력 토큰 수
      };
  
      // 텍스트 생성 요청
      const result = await model.generateContent(prompt, generationConfig);
      const response = await result.response;
      const summary = await response.text(); // 요약 결과 텍스트 추출
  
      // console.log('Gemini 응답 전문:', response); // 전체 응답 구조 확인용
  
      if (!summary) {
        throw new Error('Gemini API로부터 유효한 요약 결과를 받지 못했습니다.');
      }
  
      console.log('생성된 요약 (Gemini):', summary);
  
      res.status(200).json({ summary });
  
    } catch (error) {
      console.error('AI 요약 API 오류 (Gemini):', error);
      // Gemini 관련 오류 처리 (더 구체적인 오류 처리는 SDK 문서 참고)
      // 예: API 키 오류, 할당량 초과 등
      // Gemini API 오류는 종종 error.message나 error.details 등에 정보가 포함될 수 있음
      res.status(500).json({ message: error.message || 'AI 요약 처리 중 서버 내부 오류 발생' });
    }
  });

// --- 피드백 저장 API 엔드포인트 ---
app.post('/api/feedback', (req, res) => {
    try {
      const { date, goodPoints, badPoints } = req.body;
  
      // 유효성 검사 (날짜는 필수, 내용은 최소 하나는 있어야 의미있음)
      if (!date) {
        return res.status(400).json({ message: 'Missing required field: date' });
      }
      if ((!goodPoints || goodPoints.trim().length === 0) && (!badPoints || badPoints.trim().length === 0)) {
        return res.status(400).json({ message: '잘한 점 또는 아쉬운 점 중 하나는 입력해주세요.' });
      }
  
      // 새 피드백 데이터 객체 생성
      const newFeedback = {
        id: uuidv4(), // 고유 ID
        date,
        goodPoints: goodPoints || '', // 없으면 빈 문자열
        badPoints: badPoints || '',   // 없으면 빈 문자열
        createdAt: new Date().toISOString(),
      };
  
      // 데이터 저장
      feedbackStore.push(newFeedback);
  
      console.log('Feedback saved:', newFeedback);
      console.log('Current feedbackStore:', feedbackStore); // 저장 상태 확인
  
      // 성공 응답 전송
      res.status(201).json({ message: 'Feedback saved successfully', data: newFeedback });
  
    } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // --- 피드백 조회 API 엔드포인트 ---
  app.get('/api/feedback', (req, res) => {
    try {
      // 최신 데이터가 위로 오도록 정렬
      const sortedFeedback = [...feedbackStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json(sortedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// 서버 시작
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
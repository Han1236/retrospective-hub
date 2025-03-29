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
      const sortedData = [...dataStore].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
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
      const sortedEmotions = [...emotionStore].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
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
        maxOutputTokens: 500, // 최대 출력 토큰 수
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
      const sortedFeedback = [...feedbackStore].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      res.status(200).json(sortedFeedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

// --- 다음 주 계획 추천 API 엔드포인트 (새로 추가) ---
app.post('/api/recommend-plan', async (req, res) => {
    try {
      // 클라이언트로부터 분석할 데이터를 받음 (예: 최근 피드백, 감정 메모)
      // MVP에서는 단순하게 가장 최근 데이터 텍스트를 받는다고 가정
      const { recentBadPoints, recentEmotionMemo } = req.body;
  
      // 최소한의 데이터는 있어야 추천 가능
      if (!recentBadPoints && !recentEmotionMemo) {
        return res.status(400).json({ message: '분석할 회고 내용(아쉬운 점 또는 감정 메모)이 필요합니다.' });
      }
  
      // 프롬프트 구성 (AI에게 역할과 목표 명확히 제시)
      let promptContent = "당신은 사용자의 회고를 바탕으로 성장을 돕는 조언가입니다.\n";
      promptContent += "다음은 사용자의 최근 회고 내용입니다:\n";
      if (recentBadPoints) {
        promptContent += `- 아쉬웠던 점/교훈: ${recentBadPoints}\n`;
      }
      if (recentEmotionMemo) {
        promptContent += `- 느낀 감정/생각: ${recentEmotionMemo}\n`;
      }
      promptContent += "\n이 내용을 바탕으로, 사용자가 다음 주에 실천해볼 수 있는 구체적인 행동 계획이나 개선 아이디어를 2가지 제안해주세요.";
      promptContent += " 각 제안은 실현 가능하고 긍정적인 방향으로 작성해주세요. 번호 목록 형식으로 답변해주세요.";
  
      console.log('계획 추천 요청 프롬프트:', promptContent);
  
      // --- Google Gemini API 호출 ---
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const generationConfig = {
        temperature: 0.7, // 약간 더 창의적인 제안을 위해 온도 조절 가능
        maxOutputTokens: 500, // 충분한 답변 길이 확보
      };
  
      const result = await model.generateContent(promptContent, generationConfig);
      const response = await result.response;
      const recommendationsText = await response.text();
  
      if (!recommendationsText) {
        throw new Error('Gemini API로부터 유효한 추천 결과를 받지 못했습니다.');
      }
  
      console.log('생성된 계획 추천 (원본):', recommendationsText);

      // --- 개선된 응답 파싱 로직 ---
      const recommendations = [];
      const lines = recommendationsText.split('\n');
      let currentRecommendation = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^(\d+)\.\s*(.*)/); // 숫자로 시작하는지 확인

        if (match) {
          // 새로운 번호 목록 시작
          const title = match[2]; // 숫자와 점 뒤의 내용 (제목)
          if (currentRecommendation) {
            // 이전 추천 항목을 배열에 추가 (내용 정리 후)
            currentRecommendation.description = currentRecommendation.description.trim();
            recommendations.push(currentRecommendation);
          }
          // 새 추천 항목 객체 시작
          currentRecommendation = {
            // title: title, // 제목만 따로 저장하거나
            description: title + '\n' // 제목 포함해서 상세 설명 시작
          };
        } else if (currentRecommendation && trimmedLine.length > 0) {
          // 현재 추천 항목에 속하는 내용 추가 (빈 줄 제외)
          // 들여쓰기나 마커('*', '-') 등을 고려하여 더 정교하게 파싱할 수도 있음
          // 예: if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) ...
          currentRecommendation.description += trimmedLine + '\n'; // 줄바꿈 유지하며 추가
        } else if (currentRecommendation && trimmedLine.length === 0 && currentRecommendation.description.trim().length > 0) {
           // 빈 줄을 만나면 단락 구분으로 추가 (선택적)
           currentRecommendation.description += '\n';
        }
      }

      // 마지막 추천 항목 추가
      if (currentRecommendation) {
        currentRecommendation.description = currentRecommendation.description.trim();
        recommendations.push(currentRecommendation);
      }

      // 만약 파싱된 결과가 비어있으면 원본 텍스트 사용 (안전 장치)
      const finalRecommendations = recommendations.length > 0
          ? recommendations.map(r => r.description) // 객체 배열 대신 설명 문자열 배열로 반환 (기존과 호환)
          // 만약 객체 배열로 반환하고 싶다면: ? recommendations
          : [recommendationsText];

      console.log('파싱된 계획 추천:', finalRecommendations);

      res.status(200).json({ recommendations: finalRecommendations });
  
    } catch (error) {
      console.error('AI 계획 추천 API 오류:', error);
      res.status(500).json({ message: error.message || 'AI 계획 추천 처리 중 서버 내부 오류 발생' });
    }
  });

// 서버 시작
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
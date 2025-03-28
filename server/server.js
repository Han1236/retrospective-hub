// server/server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // uuid 라이브러리 임포트

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // JSON 요청 본문 파싱

// --- 데이터 저장을 위한 임시 메모리 DB ---
let dataStore = []; // 데이터를 저장할 배열
let emotionStore = []; // 감정 데이터를 저장할 배열 추가

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

// 서버 시작
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
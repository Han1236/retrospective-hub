// server/server.js
const express = require('express');
const cors = require('cors'); // CORS 미들웨어 추가

const app = express();
const port = process.env.PORT || 3001; // 포트 설정 (React 기본 포트 3000 피하기)

// CORS 설정 (개발 중에는 모든 출처 허용, 배포 시에는 특정 출처만 허용하도록 변경 필요)
app.use(cors());

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// 기본 라우트 (테스트용)
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
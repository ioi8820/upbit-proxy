// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 코인 리스트
const coins = ["BTC", "ETH", "XRP", "STORJ"]; // 원하는 코인들 추가 가능

// CORS 허용
app.use(cors());

// /coins 요청 처리
app.get('/coins', (req, res) => {
  res.json(coins);
});

// /kimchi/:coin 요청 처리 (더미 응답)
app.get('/kimchi/:coin', (req, res) => {
  const { coin } = req.params;
  res.json({
    coin: coin,
    binance: (Math.random() * 50000).toFixed(2),
    upbit: (Math.random() * 50000).toFixed(2),
    kimchi: (Math.random() * 10 - 5).toFixed(2), // -5% ~ 5%
  });
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

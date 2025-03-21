// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// 임시 더미 코인 리스트 (나중에 API 연결 예정)
const upbitCoins = ["BTC", "ETH", "XRP", "STORJ", "DOGE"];
const binanceCoins = ["BTC", "ETH", "XRP", "DOGE", "ADA"];

// 중복된 코인 필터링
const coins = upbitCoins.filter(coin => binanceCoins.includes(coin));

app.use(cors());

// /coins → 중복 코인만 응답
app.get('/coins', (req, res) => {
  res.json(coins);
});

// /kimchi/:coin → 더미 데이터로 응답 (나중에 실제 데이터로 대체)
app.get('/kimchi/:coin', (req, res) => {
  const { coin } = req.params;
  res.json({
    coin: coin,
    binance: (Math.random() * 50000).toFixed(2),
    upbit: (Math.random() * 50000).toFixed(2),
    kimchi: (Math.random() * 10 - 5).toFixed(2),
  });
});

app.listen(port, () => {
  console.log(`✅ Proxy server running on port ${port}`);
});

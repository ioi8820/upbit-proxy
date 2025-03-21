// server.js (CommonJS 방식)
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 중복 코인 리스트 (예시)
const coins = ["BTC", "ETH", "XRP", "DOGE"];

app.use(cors());

app.get('/coins', (req, res) => {
  res.json(coins);
});

app.get('/kimchi/:coin', (req, res) => {
  const { coin } = req.params;
  res.json({
    coin: coin,
    binance: (Math.random() * 50000).toFixed(2),
    upbit: (Math.random() * 50000).toFixed(2),
    kimchi: (Math.random() * 10 - 5).toFixed(2)
  });
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

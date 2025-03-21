// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 업비트 & 바이낸스 중복 상장 코인 리스트 (기호 기준)
const coins = ["BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX", "MATIC", "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "EOS", "ZIL", "WAVES", "CHZ", "STMX", "CVC", "ANKR", "STORJ", "ICX", "BCH", "NEO"];

app.use(cors());

// 코인 리스트 반환
app.get('/coins', (req, res) => {
  res.json(coins);
});

// 김치 프리미엄 계산 엔드포인트
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();
  try {
    const [upbitRes, binanceRes] = await Promise.all([
      axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`),
      axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`)
    ]);

    const upbitPrice = parseFloat(upbitRes.data[0].trade_price);
    const binanceUSDT = parseFloat(binanceRes.data.price);

    // 환율 (예: 1320원/달러)
    const krwPerUSDT = 1320;
    const binancePriceInKRW = binanceUSDT * krwPerUSDT;

    // 김치프리미엄 계산
    const kimchi = (((upbitPrice - binancePriceInKRW) / binancePriceInKRW) * 100).toFixed(2);

    res.json({
      coin,
      binance: binancePriceInKRW.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

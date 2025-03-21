// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// 환율 (임시 고정값, 나중에 실시간으로 받아올 수 있음)
const USD_KRW = 1340;

// 코인 리스트 (업비트 & 바이낸스 공통)
const coins = ['BTC', 'ETH', 'XRP', 'DOGE'];

// CORS 허용
app.use(cors());

// /coins 요청 (코인 리스트 전달)
app.get('/coins', (req, res) => {
  res.json(coins);
});

// /kimchi/:coin 요청 처리
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();

  try {
    // 바이낸스 USDT 가격
    const binanceRes = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
    const binancePrice = parseFloat(binanceRes.data.price);

    // 업비트 원화 가격
    const upbitRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`);
    const upbitPrice = upbitRes.data[0].trade_price;

    // 김치 프리미엄 계산
    const convertedBinanceKRW = binancePrice * USD_KRW;
    const kimchiPremium = ((upbitPrice / convertedBinanceKRW) - 1) * 100;

    res.json({
      coin,
      binance: convertedBinanceKRW.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi: kimchiPremium.toFixed(2)
    });

  } catch (error) {
    console.error(`Error fetching price for ${coin}:`, error.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`🚀 Proxy server running at http://localhost:${port}`);
});

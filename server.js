// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 중복 상장된 코인 리스트 (바이낸스 + 업비트 기준)
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX", "MATIC",
  "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "EOS", "ZIL", "WAVES",
  "CHZ", "STMX", "CVC", "ANKR", "STORJ", "ICX", "BCH", "NEO"
];

// CORS 허용
app.use(cors());

// 코인 리스트 반환
app.get('/coins', (req, res) => {
  res.json(coins);
});

// 김치 프리미엄 계산
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();
  if (!coins.includes(coin)) {
    return res.status(404).json({ error: `지원하지 않는 코인입니다. (${coin})` });
  }

  try {
    // 환율 가져오기
    const fxRes = await axios.get("https://api.exchangerate.host/latest?base=USD&symbols=KRW");
    const exchangeRate = fxRes.data.rates?.KRW;

    if (!exchangeRate) {
      throw new Error("환율 정보를 가져올 수 없습니다.");
    }

    // 바이낸스 가격 (USDT 기준, KRW로 변환 필요)
    const binanceRes = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
    const binancePrice = parseFloat(binanceRes.data.price) * exchangeRate;

    // 업비트 가격 (KRW)
    const upbitRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`);
    const upbitPrice = upbitRes.data[0].trade_price;

    // 김치 프리미엄 계산
    const kimchi = (((upbitPrice - binancePrice) / binancePrice) * 100).toFixed(2);

    res.json({
      coin,
      binance: binancePrice.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });
  } catch (error) {
    console.error("🚨 오류:", error.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${port}`);
});

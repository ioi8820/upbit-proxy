const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 중복 상장된 코인 리스트 (업비트 & 바이낸스)
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "SOL", "ADA", "AVAX", "MATIC", "TRX", "DOT",
  "LINK", "LTC", "BCH", "ATOM", "SAND", "AXS", "STX", "NEAR", "ETC", "EOS",
  "WAVES", "CHZ", "ZIL", "ICX", "KLAY", "XLM", "1INCH", "CVC", "GMT", "HIVE"
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

  try {
    const [upbitRes, binanceRes] = await Promise.all([
      axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`),
      axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`)
    ]);

    const upbitPrice = parseFloat(upbitRes.data[0].trade_price);
    const binanceUSDT = parseFloat(binanceRes.data.price);

    const krwPerUSDT = 1320; // 환율 고정 or 추후 자동화 가능
    const binancePriceInKRW = binanceUSDT * krwPerUSDT;

    const kimchi = (((upbitPrice - binancePriceInKRW) / binancePriceInKRW) * 100).toFixed(2);

    res.json({
      coin,
      binance: binancePriceInKRW.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });
  } catch (error) {
    console.error(`[ERROR: ${coin}]`, error.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`✅ Proxy server running on port ${port}`);
});

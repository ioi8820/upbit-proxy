const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ 업비트와 바이낸스 공통 코인 리스트
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX",
  "MATIC", "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "EOS",
  "ZIL", "WAVES", "CHZ", "STMX", "CVC", "ANKR", "STORJ", "ICX", "BCH", "NEO"
];

// ✅ 환율 기본값 및 업데이트 함수
let exchangeRate = 1300; // 초기값 (백업용)

// 환율 실시간 업데이트
const updateExchangeRate = async () => {
  try {
    const res = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=KRW');
    exchangeRate = res.data.rates.KRW;
    console.log('💱 환율 업데이트 완료:', exchangeRate);
  } catch (err) {
    console.error('김프 계산 오류: 환율 정보를 가져올 수 없습니다.', err.message);
  }
};
updateExchangeRate(); // 서버 시작 시 1회 실행
setInterval(updateExchangeRate, 1000 * 60 * 10); // 10분마다 갱신

// ✅ 코인 리스트 API
app.get('/coins', (req, res) => {
  res.json(coins);
});

// ✅ 김프 계산 API
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();
  if (!coins.includes(coin)) {
    return res.status(404).json({ error: '지원하지 않는 코인입니다.' });
  }

  try {
    const binanceRes = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
    const upbitRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`);

    const binancePrice = parseFloat(binanceRes.data.price) * exchangeRate;
    const upbitPrice = upbitRes.data[0].trade_price;
    const kimchi = (((upbitPrice - binancePrice) / binancePrice) * 100).toFixed(2);

    res.json({
      coin,
      binance: binancePrice.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });
  } catch (err) {
    console.error(`김프 계산 실패 (${coin}):`, err.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

// ✅ 서버 실행
app.listen(port, () => {
  console.log(`✅ Proxy server is running on port ${port}`);
});

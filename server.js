// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ 중복 상장된 코인 리스트 (업비트 + 바이낸스 기준)
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX",
  "MATIC", "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "EOS",
  "ZIL", "WAVES", "CHZ", "STMX", "CVC", "ANKR", "STORJ", "ICX", "BCH", "NEO"
];

// ✅ 환율 저장 변수
let exchangeRate = 0;

// ✅ 환율 업데이트 함수
async function updateExchangeRate() {
  try {
    const response = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=KRW');
    exchangeRate = response.data.rates.KRW;
    console.log(`💱 현재 환율(USD→KRW): ${exchangeRate}`);
  } catch (err) {
    console.error('⚠️ 환율 정보를 불러오는 데 실패했습니다:', err.message);
  }
}

// 최초 1회 실행 및 주기적 갱신
updateExchangeRate();
setInterval(updateExchangeRate, 10 * 60 * 1000); // 10분마다 갱신

// ✅ 코인 리스트 API
app.get('/coins', (req, res) => {
  res.json(coins);
});

// ✅ 김치 프리미엄 계산 API
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();

  if (!coins.includes(coin)) {
    return res.status(404).json({ error: `지원하지 않는 코인입니다. (${coin})` });
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
      kimchi: kimchi
    });
  } catch (error) {
    console.error(`❌ ${coin} 가격 정보를 가져오지 못했습니다:`, error.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

// ✅ 서버 실행
app.listen(port, () => {
  console.log(`🚀 Proxy server listening on port ${port}`);
});

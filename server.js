import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

// 업비트 & 바이낸스 중복 상장된 코인 리스트
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX", "MATIC",
  "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "EOS", "ZIL", "WAVES", "CHZ",
  "STMX", "CVC", "STORJ", "ANKR", "ICX", "BCH", "NEO"
];

let exchangeRate = null;

// 환율 갱신 함수
const fetchExchangeRate = async () => {
  try {
    const res = await axios.get('https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD');
    exchangeRate = parseFloat(res.data[0]?.basePrice);
    console.log(`✅ 환율 갱신: 1 USD = ${exchangeRate} KRW`);
  } catch (err) {
    console.error('❌ 환율 갱신 실패:', err.message);
  }
};

// 10분마다 환율 갱신
fetchExchangeRate();
setInterval(fetchExchangeRate, 10 * 60 * 1000);

// CORS 허용
app.use(cors());

// 코인 리스트 반환
app.get('/coins', (req, res) => {
  res.json(coins);
});

// 김치프리미엄 계산 API
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();

  if (!coins.includes(coin)) {
    return res.status(404).json({ error: '지원하지 않는 코인입니다.' });
  }

  if (!exchangeRate) {
    return res.status(500).json({ error: '환율 정보를 가져올 수 없습니다.' });
  }

  try {
    const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`;
    const upbitUrl = `https://api.upbit.com/v1/ticker?markets=KRW-${coin}`;

    const [binanceRes, upbitRes] = await Promise.all([
      axios.get(binanceUrl),
      axios.get(upbitUrl)
    ]);

    const binancePrice = parseFloat(binanceRes.data.price) * exchangeRate;
    const upbitPrice = upbitRes.data[0]?.trade_price;
    const kimchi = (((upbitPrice - binancePrice) / binancePrice) * 100).toFixed(2);

    res.json({
      coin,
      binance: binancePrice.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });

  } catch (error) {
    console.error(`김프 계산 오류: ${error.message}`);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

app.listen(port, () => {
  console.log(`✅ Proxy server is running on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

let exchangeRate = 1350; // 기본 환율 (초기값)
let coins = ["BTC", "ETH", "XRP", "DOGE"]; // 중복 상장 코인

// CORS 설정
app.use(cors());

// 환율 업데이트 함수
const updateExchangeRate = async () => {
  try {
    const res = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=KRW');
    exchangeRate = res.data.rates.KRW;
    console.log('✅ 환율 업데이트:', exchangeRate);
  } catch (error) {
    console.error('❌ 환율 가져오기 실패:', error.message);
  }
};

// 서버 시작 시 + 10분마다 환율 업데이트
updateExchangeRate();
setInterval(updateExchangeRate, 10 * 60 * 1000);

// 코인 리스트 제공
app.get('/coins', (req, res) => {
  res.json(coins);
});

// 김치 프리미엄 계산
app.get('/kimchi/:coin', async (req, res) => {
  const coin = req.params.coin.toUpperCase();

  if (!coins.includes(coin)) {
    console.log(`[❌] 지원하지 않는 코인 요청됨: ${coin}`);
    return res.status(404).json({ error: '지원하지 않는 코인입니다.' });
  }

  try {
    const binanceRes = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin}USDT`);
    const upbitRes = await axios.get(`https://api.upbit.com/v1/ticker?markets=KRW-${coin}`);

    const binancePrice = parseFloat(binanceRes.data.price) * exchangeRate;
    const upbitPrice = upbitRes.data[0].trade_price;
    const kimchi = (((upbitPrice - binancePrice) / binancePrice) * 100).toFixed(2);

    // 👉 로그 출력
    console.log(`[✅] ${coin} 김치프리미엄 계산 성공`);
    console.log(`    환율: ${exchangeRate}`);
    console.log(`    바이낸스 (USDT): ${binanceRes.data.price}`);
    console.log(`    업비트 (KRW): ${upbitPrice}`);
    console.log(`    김프: ${kimchi}%`);

    res.json({
      coin,
      binance: binancePrice.toFixed(2),
      upbit: upbitPrice.toFixed(2),
      kimchi
    });

  } catch (err) {
    console.error(`[💥] ${coin} 김프 계산 실패:`, err.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});


app.listen(port, () => {
  console.log(`✅ Proxy server running on port ${port}`);
});

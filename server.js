// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// 업비트와 바이낸스에 모두 상장된 코인들
const coins = [
  "BTC", "ETH", "XRP", "DOGE", "ADA", "SOL", "AVAX", "DOT", "TRX",
  "MATIC", "LINK", "LTC", "SAND", "AXS", "APE", "ETC", "ZIL", "WAVES",
  "CHZ", "STMX", "CVC", "ANKR", "STORJ", "ICX", "BCH", "NEO"
];

app.use(cors());

// /coins: 사용 가능한 코인 리스트 반환
app.get("/coins", (req, res) => {
  res.json(coins);
});

// /kimchi/:coin: 김치프리미엄 계산
app.get("/kimchi/:coin", async (req, res) => {
  const coin = req.params.coin.toUpperCase();
  if (!coins.includes(coin)) {
    return res.status(404).json({ error: `지원하지 않는 코인입니다 (${coin})` });
  }

  try {
    // 환율 정보
    const fxRes = await axios.get("https://api.exchangerate.host/latest?base=USD&symbols=KRW");
    const exchangeRate = fxRes.data?.rates?.KRW;
    if (!exchangeRate) throw new Error("환율 정보를 가져올 수 없습니다.");

    // 가격 정보
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
  } catch (error) {
    console.error("김프 계산 오류:", error.message);
    res.status(500).json({ error: `가격 정보를 가져올 수 없습니다 (${coin})` });
  }
});

app.listen(port, () => {
  console.log(`✅ Proxy server listening on port ${port}`);
});

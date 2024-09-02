require("dotenv").config();
const { ethers } = require("ethers");

const { INTERVAL, QUOTER_ADDRESS, TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, PROVIDER_URL } = process.env;

const QUOTER_ABI = require("./Quoter.abi.json");

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);

async function executionCycle(tokenIn, tokenOut, fee) {

  const quoterContract = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);

  const [amountOut] = await quoterContract.quoteExactInputSingle.staticCall({
    tokenIn,
    tokenOut,
    fee,
    amountIn: ethers.parseEther("1"),
    sqrtPriceLimitX96: 0
  })

  console.log("WBNB 1 is equals to USDT " + ethers.formatUnits(amountOut, 18));
}

setInterval(() => executionCycle(TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, 100), INTERVAL);

executionCycle(TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, 100);
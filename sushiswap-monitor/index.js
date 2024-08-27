require("dotenv").config();
const { ethers } = require("ethers");

const { INTERVAL, QUOTER_ADDRESS, TOKEN_IN_ADDRESS, TOKEN_OUT_ADDRESS, NETWORK, INFURA_API_KEY } = process.env;

const provider = new ethers.InfuraProvider(NETWORK, INFURA_API_KEY);
const QUOTER_ABI = require("./Quoter.abi.json");
const quoterContract = new ethers.Contract(QUOTER_ADDRESS, QUOTER_ABI, provider);

async function executionCycle() {    
    const [amountOut] = await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn: TOKEN_IN_ADDRESS,//WETH
        tokenOut: TOKEN_OUT_ADDRESS,//USDC
        amountIn: ethers.parseEther("1"),
        fee: 3000,
        sqrtPriceLimitX96: 0
    })

    console.log("WETH 1 is equals to USDC " + ethers.formatUnits(amountOut, 6));
}

setInterval(() => executionCycle(), INTERVAL);

executionCycle();
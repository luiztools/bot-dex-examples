require("dotenv").config();
const { ethers } = require("ethers");

const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS;
const WALLET = process.env.WALLET;
const TOKEN0 = process.env.TOKEN0_ADDRESS;
const TOKEN1 = process.env.TOKEN1_ADDRESS;
const PRICE_TO_BUY = parseFloat(process.env.PRICE_TO_BUY);
const AMOUNT_TO_BUY = ethers.parseUnits(process.env.AMOUNT_TO_BUY, "ether");
const PRICE_TO_SELL = PRICE_TO_BUY * parseFloat(process.env.PROFITABILITY);

let isOpened = false, isApproved = false, amountOut = 0;

const ABI_ROUTER = require("./abi.router.json");
const ABI_ERC20 = require("./abi.erc20.json");

const provider = new ethers.InfuraProvider(process.env.NETWORK, process.env.INFURA_API_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const router = new ethers.Contract(ROUTER_ADDRESS, ABI_ROUTER, signer);
const token0 = new ethers.Contract(TOKEN0, ABI_ERC20, signer);
const token1 = new ethers.Contract(TOKEN1, ABI_ERC20, signer);

async function approve(tokenContract, amountInWei) {
    const tx = await tokenContract.approve(ROUTER_ADDRESS, amountInWei);
    console.log("Approving at " + tx.hash);
    await tx.wait();
    console.log("Approved!");
}

async function swap(tokenIn, tokenOut, amountIn) {
    console.log("Building params...");
    const params = {
        tokenIn,
        tokenOut,
        fee: 3000,//poolFee = 0.3% * 10000
        recipient: WALLET,
        deadline: Math.ceil((Date.now()/1000)) + 10,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
    }

    const tx = await router.exactInputSingle(params, {
        from: WALLET,
        gasPrice: ethers.parseUnits('10', 'gwei'),
        gasLimit: 250000
    });
    console.log("Swapping at " + tx.hash);
    const receipt = await tx.wait();

    const amountOut = ethers.toBigInt(receipt.logs[0].data);
    console.log("Received " + ethers.formatUnits(amountOut, "ether"));

    return amountOut;
}

async function getPrice(poolId) {
    const query = `{
        pool(id: "${poolId}"){
            id,
          feeTier,
          token0Price,
          token1Price,
          token0 {
            symbol,
            id,
            decimals
          }
          token1 {
            symbol,
            id,
            decimals
          }
        }
      }`;
    const { data } = await axios.post(process.env.GRAPH_API_URL, { query });
    return parseFloat(data.data.token0price);
}

async function executeCycle() {
    const usdPrice = await getPrice(process.env.POOL_ID);
    console.log("USD " + usdPrice);

    if (!isApproved) {
        await approve(token1, AMOUNT_TO_BUY);//approving buy
        isApproved = true;
    }

    if (usdPrice < PRICE_TO_BUY && !isOpened) {
        isOpened = true;
        amountOut = await swap(TOKEN1, TOKEN0, AMOUNT_TO_BUY);

        await approve(token0, amountOut);//approving sell
    }
    else if (isOpened && usdPrice > PRICE_TO_SELL) {
        isOpened = false;
        await swap(TOKEN0, TOKEN1, amountOut);

        amountOut = 0;
        isApproved = false;
    }
}

setInterval(executeCycle, process.env.INTERVAL);

executeCycle();
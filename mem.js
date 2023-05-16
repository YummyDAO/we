const ethers = require('ethers');
require("dotenv").config
//const fetch = require('node-fetch-commonjs');
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const addresses = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', 
  router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  Sniperaddress: '',
  owner: '',
}

const JSON_FILE = "pair.json";

//const provider = new ethers.providers.WebSocketProvider('wss://eth.llamarpc.com/rpc/01H04R0B7VA3KVVSQXV30B4ZHN');
//support for websocket you can easily switch from https to wss
const NODE_URL = "https://eth.llamarpc.com/rpc/01H04R0B7VA3KVVSQXV30B4ZHN";
const provider = new ethers.providers.JsonRpcProvider(NODE_URL)
const account = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log(account)
const factory = new ethers.Contract(
  addresses.factory,
  ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
  account
);
const router = new ethers.Contract(
  addresses.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
  ],
  account
);

let ownershiprenounced;
let tax;
const eachtokenbuy = ethers.utils.parseEther('1'); //for testing purposes we are using one
let gaslatest;
let bboughtblock;

async function checkownership(tkn){
    const zero = ethers.constants.AddressZero;
    const owner = new ethers.Contract(
        tkn,
        [
            'function owner() public view virtual returns (address)'
        ],
        account
      );

      console.log(zero)
      if(owner.owner() === zero){
        ownershiprenounced = true;
      } else{
        ownershiprenounced = false;
      }
      console.log("ownership modified",ownershiprenounced)
}

async function checktax(tknin, tknout, amountin , amountout){
  const SniperContract = new ethers.Contract(
    addresses.Sniperaddress,
    [
      'function getAmountOutMin(address _tokenIn, address _tokenOut, uint256 _amountIn) external view returns (uint256)',
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function swap(address _tokenIn, address _tokenOut, uint256 _amountIn, uint256 _amountOutMin, address _to)'
    ],
    account
  );
  const deadline = Date.now() + 1000 * 60 * 10; //add function for this make sure it's block.timestamp + 10 mins on average;
  const amountfromswap = SniperContract.callStatic.swap(tknin, amountout, amountin, [tknin,tknout], addresses.owner, deadline,{
    value: amountin,
    gasLimit: 1000000,
    gasPrice: gaslatest * 2,
});
  const amountfrommin = SniperContract.getAmountOutMin(tknin, tknout, amountfromswap);
  console.log("amountoutcallstatic",amountfromswap)
  if(amountfromswap < amountfrommin){
    tax = true;
  } else{
    tax = false;
  }
  //Now we check amounts min from getamountminimum then we run callstatic on the several amounts then we compare
}

async function looptokens(token0, token1){
  //get Tokens from json file, check which has the owner value as false and reloop through check ownership;
  //then we run all previous checks again to see if we can purchase it now

  const fs = require('fs')
  const file = fs.readFileSync('student.json')

  const json = JSON.parse(file.toString())
  console.log(file.toString())
  console.log(json)

  for(let i = 0; i < json.length; i++) {
    let obj = json[i];
    console.log('we',obj)

    //checks
    if(obj.tax === false){
      checktax(token0, token1, ethers.utils.parseEther('1') , ethers.utils.parseEther('1'))
    }
    if(obj.owner === false){
      checkownership(token1);
    }

    obj.owner = ownershiprenounced;
    obj.tax = tax;
    const amountout = ethers.utils.parseEther('1');
    if(obj.owner && obj.tax === true && obj.bought === false){
      swap(tokenIn, amountout, eachtokenbuy)
      obj.bought = true;
    }

    if(obj.bought === true){
      Checktime(token1)
      GetTokenBuysCount(token1)
    }

    console.log('we', obj)

    console.log('called loop')
}

fs.writeFileSync("student.json", JSON.stringify(json))
console.log(json)
}

//looptokens()

async function Checktime(tknin){
  const SniperContract = new ethers.Contract(
    addresses.Sniperaddress,
    [
      'function getAmountOutMin(address _tokenIn, address _tokenOut, uint256 _amountIn) external view returns (uint256)',
      'function swap(address _tokenIn, address _tokenOut, uint256 _amountIn, uint256 _amountOutMin, address _to)',
      'function lastbuytime(address _tokenIn) external view returns (uint256)'
    ],
    account
  );

  const time = SniperContract.lastbuytime(tknin); //add on sniper contract
  const fivemins = 60 * 5 ;
  const newtime = time + fivemins;
  //since time has been gotten we check if 5 mins has passed
  let timenow = Date.now();  //add code for timenow
  console.log(timenow)
  if(timenow >= newtime){
    //we need to call a function that sells token back to weth here;
    //we can get the entire balance of token sell back to weth.
    const ERC20Contract = new ethers.Contract(
      token1,
      [
        'function balanceOf(address account) external view returns (uint256);'
      ],
      account
    );
  
    const amountin = ERC20Contract.balanceof(addresses.owner);
    console.log("token out balance",amountin)
    const amountout = ethers.utils.parseEther('0.000001') //since we are trading to weth, to account for all scenerios
    swap(tknin, amountout, amountin);

    timersold = true;
  }

  console.log(timersold)
}
Checktime()

async function GetGas() {
  const url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=6ECTU8BIUKCK1UW63TK76XTBEYSWXMD6YN'
  const response = await fetch(url);
  const data = await response.json();

  console.log(data);
  const gas1 = data.result.FastGasPrice;
  gaslatest = ethers.utils.parseUnits(gas1, 'gwei');
  console.log(gaslatest.toString())
  //after every fetch we save to gas latest
  //can also set a min and max range for our gas
  let gaslimit = 21000
  let basefee = data.result.suggestBaseFee;

  const estimatedbase = gaslimit * (basefee + gas1);
  const round = Math.round(estimatedbase);
  const converttowei = ethers.utils.parseUnits(round.toString(), 'gwei');
  const toether =ethers.utils.formatEther(converttowei.toString())
  console.log(estimatedbase)
  console.log(converttowei.toString())
  console.log(toether)
}

//GetGas()

async function GetTokenBuysCount(token1){
  //Check any transfer event with uniswap router as the from address with token equal token we watching
  //Or we also check swapethtotokens and swapexacttokensfortokens events 
  //this for out swapethtotokens or swapexacttokensfortokens case scenerio.
  //We can get start block from our buy time then also check if json count up  to 5
  //Checktime to make sure time is accurate

  const url = 'https://api.etherscan.io/api?module=account&action=tokentx&from=' + addresses.router + '&contractaddress=' + token1 + '&address=' + addresses.router + '&page=1&offset=100&startblock=' + bboughtblock + '&endblock=99999999&sort=desc&apikey=6ECTU8BIUKCK1UW63TK76XTBEYSWXMD6YN'
  const response = await fetch(url);
  //console.log(url)
  //const url1 = 'https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xdac17f958d2ee523a2206206994597c13d831ec7&address=0xdfd5293d8e347dfe59e90efd55b2956a1343963d&page=1&offset=100&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken'
  const data = await response.json();
  //console.log(data)

  const count = Object.keys(data.result).length;
  console.log(count);

  let buycounts = 10;

  if (count >= buycounts){
    const ERC20Contract = new ethers.Contract(
      token1,
      [
        'function balanceOf(address account) external view returns (uint256);'
      ],
      account
    );
  
    const amountin = ERC20Contract.balanceof(addresses.owner);
    console.log("token out balance",amountin)
    const amountout = ethers.utils.parseEther('0.000001') //since we are trading to weth, to account for all scenerios
    swap(token1, amountout, amountin);
  }

  //WE HAVE TO READ IF BOUGHT
}

//GetTokenBuysCount(addresses.WETH)


async function swap(tknin, amountout, amountin, token0, token1){
  const SniperContract = new ethers.Contract(
    addresses.Sniperaddress,
    [
      'function getAmountOutMin(address _tokenIn, address _tokenOut, uint256 _amountIn) external view returns (uint256)',
      'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
      'function swap(address _tokenIn, address _tokenOut, uint256 _amountIn, uint256 _amountOutMin, address _to)'
    ],
    account
  );
  const deadline = Date.now() + 1000 * 60 * 10; //Deadline is 10 mins 
  GetGas()

  const tx = SniperContract.swap(tknin, amountout, amountin, [token0,token1], addresses.owner, deadline ,{
    value: amountin,
    gasLimit: 1000000,
    gasPrice: gaslatest * 2,
});
  tx.wait()

  //we need to add support for gas fee by calling 


  if (receipt.status === 1){
    console.log("succesfully swaped")
  } else(
    console.log("transaction failed")
  )

  //Now we need to check balance of token to our contract

  const ERC20Contract = new ethers.Contract(
    token1,
    [
      'function balanceOf(address account) external view returns (uint256);'
    ],
    account
  );

  const tokenoutbal = ERC20Contract.balanceof(addresses.owner);
  console.log("token out balance",tokenoutbal)
  //cross check if we need to instead swap to our sniper contract and keep funds within the contract

  const blockNumber = await provider.getBlockNumber();
  bboughtblock = blockNumber;
}

/*async function testjson(){
  const fs = require('fs')


//check if file exist
if (!fs.existsSync('student.json')) {
    //create new file if not exist
    fs.closeSync(fs.openSync('student.json', 'w'));
}

// read file
const file = fs.readFileSync('student.json')
const file1 = fs.readFileSync('./student.json', 'utf8');

const newarray = {
  studentName: 'Joe',
  address: 'abc'
}
const data = {
    studentName: 'Joe',
    address: 'us',
    token0: 'token0',
    token1: 'token1',
    pairAddress: 'pairAddress',
    owner: false,
    tax: false,
    count: 0,
    time: 0,
}

//check if file is empty
if (file.length == 0) {
    //add data to json file
    fs.writeFileSync("student.json", JSON.stringify([data]))
} else {
    //append data to jso file
    const me = []
    const json = JSON.parse(file.toString())
    console.log(file.toString())
    console.log(json)
    json.push(data)
    console.log(json)
    json[0].studentName = 'we';
    json[0].owner = true;
    console.log(JSON.stringify(json))
    fs.writeFileSync("student.json", JSON.stringify(json))
}
}*/
//testjson()
//looptokens()

factory.on('PairCreated', async (token0, token1, pairAddress) => {
  console.log(`
    New pair detected
    =================
    token0: ${token0}
    token1: ${token1}
    pairAddress: ${pairAddress}
  `);

  GetGas()

  //The quote currency needs to be WETH (we will pay with WETH)
  let tokenIn, tokenOut;
  if(token0 === addresses.WETH) {
    tokenIn = token0; 
    tokenOut = token1;

    //checktax(token0, token1, ethers.utils.parseEther('1') , ethers.utils.parseEther('1'))
    //for amount in for check tax we would use a default value of 1 eth

    //checkownership(token1);

    const amountout = ethers.utils.parseEther('1');
    //swap(tokenIn, amountout, eachtokenbuy)
    //Checktime(token1)

    //GetTokenBuysCount(tokenOut)
    //looptokens()
  }

  if(token1 == addresses.WETH) {
    tokenIn = token1; 
    tokenOut = token0;
    //checkownership(token0)
    //checktax(token1, token0, ethers.utils.parseEther('1') , ethers.utils.parseEther('1'))
    //swap(tokenIn, amountout, eachtokenbuy)
    //Checktime(token0)
    //GetTokenBuysCount(tokenOut)
    //looptokens()
  }

  //The quote currency is not WETH
  if(typeof tokenIn === 'undefined') {
    return;
  } 

 //check ownership renounced
  if(ownershiprenounced === false){
    return;
  }

  if(tax === false){
    return;
  }

  const fs = require('fs')


  //check if file exist
  if (!fs.existsSync('student.json')) {
      //create new file if not exist
      fs.closeSync(fs.openSync('student.json', 'w'));
  }
  
  // read file
  const file = fs.readFileSync('student.json')
  const data = {
    token0: token0,
    token1: token1,
    pairAddress: pairAddress,
    owner: false,
    tax: false,
    bought: true
  }
  
  //check if file is empty
  if (file.length == 0) {
      fs.writeFileSync("student.json", JSON.stringify([data]))
  } else {
      const json = JSON.parse(file.toString())
      console.log(file.toString())
      console.log(json)
      json.push(data)
      console.log(json)
      console.log(JSON.stringify(json))
      fs.writeFileSync("student.json", JSON.stringify(json))
  }

  setInterval(looptokens(tokenIn, tokenOut), 7000); 

});
  //write to json before calling return

  //check ownwership*
  //checkbuy/sell tax
  //user can call a sell function add to contract //already added through swap on smart contract and must be unambigous

  //checks for time not more than 5 mins //for this we setinterval and we say after 5 mins we call sell function no need to loop;
  //set gas range min and max //for this we can use etherscan api or we can set minimum $30 and max $60
  //integrate gpt to analyse smart contract code //to be added later on

  //Today task:
  //check tax using callstatic on etherjs
  //get gas from etherjs api or ethereumgasstation
  //we also added support for looping through tokens check if ownwership has been renounced now.
  /*for timer we save the block.timestamp of our buy transaction, then we add 5 mins to a local variable
  *so we set a new block.timestamp, that if this condition is reached we swap tokens
  */
 //Also we can add support for getting price rise, then we set a custom price increase range if token up to this range sell.
 //how to save data in csv or json and fetch same data to loop for check ownership, also we vcan set custom value to  set this has been checked and owner already renounced.

 //json format would be :
 //pair contract
 //token0
 //token1
 //boolean value for ownership
 //field for tax
 //field for count
 
 //so if we looping through then we check those with fields owner === false;

 //check balance after each successful swap
 //also add support for getting transaction reciept after each swap

 /*we save a mapping of each token buy to block.timestamp, so if we are trying to read we can just input the token address
 * to get the last buy timestamp, then we check if it's up to 5 mins, then we swap back for weth.
 */

 //to get our number of buys - we can do either to check all swap events with events name corresponding to swapethfortokens or swaptokensfortokens
 //if swaptokensfortokens then we check if tokenin equals weth. 
 /*for checktime we save an array of tokens bought in a day then we loop through that array.
 * at every new pair indexed or we can run our checks at every new block.
 */

//Must be transferable
//Get token info: https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=0x0e3a2a1f2146d86a604adc220b4967a898d7fe07&apikey=YourApiKeyToke
//add erc20 and eth transfer to SC

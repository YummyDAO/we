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
  owner: '0x77907f52F338A0AD4E98C7F5dE2a011cb92AE800',
}

//const provider = new ethers.providers.WebSocketProvider('wss://eth.llamarpc.com/rpc/01H04R0B7VA3KVVSQXV30B4ZHN');
//support for websocket you can easily switch from https to wss
const NODE_URL = "https://eth.llamarpc.com/rpc/01H04R0B7VA3KVVSQXV30B4ZHN";
const provider = new ethers.providers.JsonRpcProvider(NODE_URL)
const account = new ethers.Wallet(/*process.env.PRIVATE_KEY*/ '7c3d60eb8e019aa3fc4faf9abafe2a55a59a0b0b7dfb57de0c4db2941bffb880', provider);
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

let ownershiprenounced = false;
let tax;
const eachtokenbuy = ethers.utils.parseEther('1'); //for testing purposes we are using one
let gaslatest;
let bboughtblock;
let ownermodifiable;
let cannotsellall;
//creator_address
  //creator_balance
let creatorpercent;
let hiddenowner;
let honeypotwithsamecreator;
let  isantiwhale;
let isblacklisted;
  //is_in_dex
let ismintable;
let ishoneypot;
let isopensource;
//let checkforlplocked
let owneraddress
let transferpausable;
let tradingcooldown;
let tokensymbol;
let tokenname;
let selltax;
let buytax;
let antiwhalemodifiable;
let boughttoken;

  const zero = ethers.constants.AddressZero;

/*async function checkownership(tkn){
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
}*/

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

    fetchdata(obj.tokenaddress)

    const amountout = ethers.utils.parseEther('1');

    if(ownershiprenounced === true && ownermodifiable === false && cannotsellall === false && honeypotwithsamecreator === false && ismintable === false && ishoneypot === false && isopensource === true && buytax === false && selltax === false && transferpausable === false && tradingcooldown === false){
      //swap(token1, amountout, amountin);
      console.log('token bought at ', eachtokenbuy)
      boughttoken = true;
    }

    if(obj.bought === true){
      Checktime(token1)
      GetTokenBuysCount(token1)
    }

    //console.log('we', obj)

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

    //timersold = true;
  }

  //console.log(timersold)
}
//Checktime()

async function GetGas() {
  const url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=6ECTU8BIUKCK1UW63TK76XTBEYSWXMD6YN'
  const response = await fetch(url);
  const data = await response.json();

  //console.log(data);
  const gas1 = data.result.FastGasPrice;
  gaslatest = ethers.utils.parseUnits(gas1, 'gwei');
  //console.log(gaslatest.toString())
  //after every fetch we save to gas latest
  //can also set a min and max range for our gas
  let gaslimit = 21000
  let basefee = data.result.suggestBaseFee;

  const estimatedbase = gaslimit * (basefee + gas1);
  const round = Math.round(estimatedbase);
  const converttowei = ethers.utils.parseUnits(round.toString(), 'gwei');
  const toether =ethers.utils.formatEther(converttowei.toString())
  //console.log(estimatedbase)
  //console.log(converttowei.toString())
  //console.log(toether)
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
  boughttoken = true;
}


//Start of test with data from old blocks

async function testme(){
const getPoolMintEvents = async (poolId, startBlock, endBlock) => {
  const mintFilter = factory.filters.PairCreated();
  console.log("Querying the Pair events...");
  const mintEvents = await factory.queryFilter(
    mintFilter,
    startBlock,
    endBlock
  );
  console.log(
    `${mintEvents.length} have been emitted by the factory between blocks ${startBlock} & ${endBlock}`
  );
  return mintEvents;
};

const mintEvents = await getPoolMintEvents(
  "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
  17278345 - 100,
  17278345
);
console.log(mintEvents);

for(let i = 0; i < mintEvents.length; i++){

console.log(`
New pair detected
=================
token0: ${mintEvents[i].args.token0}
token1: ${mintEvents[i].args.token1}
pairAddress: ${mintEvents[i].args.pair}
`);

let token0 = mintEvents[i].args.token0;
let token1 = mintEvents[i].args.token1;
let pairAddress = mintEvents[i].args.pair;


GetGas()
const amountout = ethers.utils.parseEther('1');

//The quote currency needs to be WETH (we will pay with WETH)
let tokenIn, tokenOut;
if(token0 === addresses.WETH) {
tokenIn = token0; 
tokenOut = token1;
await fetchdata(tokenOut)
if(ownershiprenounced === true && ownermodifiable === false && cannotsellall === false && honeypotwithsamecreator === false && ismintable === false && ishoneypot === false && isopensource === true && buytax === false && selltax === false && transferpausable === false && tradingcooldown === false){
  //swap(token1, amountout, amountin);
  console.log('token bought at ', eachtokenbuy)
  boughttoken = true;
}

await fetchprice(tokenOut)

console.log('called')
}

if(token1 == addresses.WETH) {
tokenIn = token1; 
tokenOut = token0;
await fetchdata(tokenOut)
//add condition checkers
//call swap
//swap(token1, amountout, amountin);
if(ownershiprenounced === true && ownermodifiable === false && cannotsellall === false && honeypotwithsamecreator === false && ismintable === false && ishoneypot === false && isopensource === true && buytax === false && selltax === false && transferpausable === false && tradingcooldown === false){
  //swap(token1, amountout, amountin);
  console.log('token bought at ', eachtokenbuy)
  boughttoken = true;
}

await fetchprice(tokenOut)

console.log('called')
}

//The quote currency is not WETH
if(typeof tokenIn === 'undefined') {
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
tokenaddress: tokenOut,
ownershiprenounced: ownershiprenounced,
ownermodifiable: ownermodifiable,
cannotsellall: cannotsellall,
creatorpercent: creatorpercent,
hiddenowner: hiddenowner,
honeypotwithsamecreator: honeypotwithsamecreator,
isantiwhale: isantiwhale,
isblacklisted: isblacklisted,
ismintable: ismintable,
ishoneypot: ishoneypot,
contractverified: isopensource,
transferpausable: transferpausable,
tradingcooldown: tradingcooldown,
tokensymbol: tokensymbol,
tokenname: tokenname,
selltax: selltax,
buytax: buytax,
antiwhalemodifiable: antiwhalemodifiable,
bought: boughttoken,
}

//check if file is empty
if (file.length == 0) {
  fs.writeFileSync("student.json", JSON.stringify([data]))
} else {
  const json = JSON.parse(file.toString())
  //console.log(file.toString())
  //console.log(json)
  json.push(data)
  //console.log(json)
  //console.log(JSON.stringify(json))
  fs.writeFileSync("student.json", JSON.stringify(json))
}

//setInterval(looptokens(tokenIn, tokenOut), 7000); 
}
}

testme()


//Fetch data for our bot to crosscheck

async function fetchdata(tkn){
  let tkn1 = '0xb2e96a63479C2Edd2FD62b382c89D5CA79f572d3';
  console.log(tkn)
  //const the = 'https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses='
  const url = `https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses=${tkn}`
  //console.log(url)
  const response = await fetch(url)
  const data1 = await response.json();
  //console.log(data1.result)
  const data2 = JSON.stringify(data1.result);
  const data3 = JSON.parse(data2);
//console.log(data.tkn)

  let text = "";
for (const x in data3) {
  text += x;
}
console.log(data1.result[text])
console.log(text)

const data = data1.result[text];

  //can_take_back_ownership
  const ownermodify = data2.can_take_back_ownership;
  if(ownermodify == 1){
    ownermodifiable = true;
    //add json
  } else{
    ownermodifiable = false;
  }
  //console.log(ownermodify)
  //buy_tax
  const buy_tax = data.buy_tax;
  if(buy_tax == 1){
    buytax = true;
    //add json
  } else{
    buytax = false;
  }
  //anti_whale_modifiable
  const anti_whale_modifiable = data.anti_whale_modifiable;
  if(anti_whale_modifiable == 1){
    antiwhalemodifiable = true;
    //add json
  } else{
    antiwhalemodifiable = false;
  }
  //cannot_sell_all
  const cannot_sell_all = data.cannot_sell_all;
  if(cannot_sell_all == 1){
    cannotsellall = true;
    //add json
  } else{
    cannotsellall = false;
  }
  //creator_address
  //creator_balance
  //creator_percent
  const creator_percent = data.creator_percent;
  creatorpercent = creator_percent;
  console.log('creator_percent', creator_percent)
  //hidden_owner
  const hidden_owner = data.hidden_owner;
  if(hidden_owner == 1){
    hiddenowner = true;
    //add json
  } else{
    hiddenowner = false;
  }
  //honeypot_with_same_creator
  const honeypot_with_same_creator = data.honeypot_with_same_creator;
  if(honeypot_with_same_creator == 1){
    honeypotwithsamecreator = true;
    //add json
  } else{
    honeypotwithsamecreator = false;
  }
  //is_anti_whale
  const is_anti_whale = data.is_anti_whale;
  if(is_anti_whale == 1){
    isantiwhale = true;
    //add json
  } else{
    isantiwhale = false;
  }
  //is_blacklisted
  const is_blacklisted = data.is_blacklisted;
  if(is_blacklisted == 1){
    isblacklisted = true;
    //add json
  } else{
    isblacklisted = false;
  }
  //is_in_dex
  //is_mintable
  const is_mintable = data.is_mintable;
  if(is_mintable == 1){
    ismintable = true;
    //add json
  } else{
    ismintable = false;
  }
  //is_honeypot
  const is_honeypot = data.is_honeypot;
  if(is_honeypot == 1){
    ishoneypot = true;
    //add json
  } else{
    ishoneypot = false;
  }
  //is_open_source
  const is_open_source = data.is_open_source;
  if(is_open_source == 1){
    isopensource = true;
    //add json
  } else{
    isopensource = false;
  }
  //checkforlplocked
  //owner_address
  const owner_address = data.owner_address;
  if(owner_address == zero){
    ownershiprenounced = true;
    //add json
  } else{
    ownershiprenounced = false;
  }
  //transfer_pausable
  const transfer_pausable = data.transfer_pausable;
  if(transfer_pausable == 1){
    transferpausable = true;
    //add json
  } else{
    transferpausable = false;
  }
  //trading_cooldown
  const trading_cooldown = data.trading_cooldown;
  if(trading_cooldown == 1){
    tradingcooldown = true;
    //add json
  } else{
    tradingcooldown = false;
  }
  //token_symbol
  tokensymbol = data.token_symbol;
  //token_name
  tokenname = data.token_name;
  //sell_tax
  const sell_tax = data.sell_tax;
  if(sell_tax == 1){
    selltax = true;
    //add json
  } else{
    selltax = false;
  }
  console.log(selltax)
  //console.log(data)*/
}
//fetchdata(tkn)

async function fetchprice(tkn){
    //const the = 'https://api.gopluslabs.io/api/v1/token_security/1?contract_addresses='
    const url = `https://api.dexscreener.io/latest/dex/tokens/${tkn}`
    //console.log(url)
    const response = await fetch(url)
    const data1 = await response.json();
    if(data1.pairs == null){
      return null;
  }else {
    console.log(data1.pairs[0].priceUsd)
    //const free = data1.pairs;
    //console.log(free)
    let noagg;
    //let obj = free[1];
    noagg = data1.pairs[0].priceUsd;
    /*for(let i = 0; i < free.length; i++) {
      let obj = free[1];
      noagg = obj.priceUsd;
      console.log('we',obj)
      console.log(noagg)
      //Get price aggregate from all pools
    }*/
    let price = noagg;
    console.log('Token price present',price)
  }
}
//fetchprice('0x5cF4284A6187e6476d9E2F9f48e845fa899886fD')


/*factory.on('PairCreated', async (token0, token1, pairAddress) => {
  console.log(`
    New pair detected
    =================
    token0: ${token0}
    token1: ${token1}
    pairAddress: ${pairAddress}
  `);

  GetGas()
  const amountout = ethers.utils.parseEther('1');

  //The quote currency needs to be WETH (we will pay with WETH)
  let tokenIn, tokenOut;
  if(token0 === addresses.WETH) {
    tokenIn = token0; 
    tokenOut = token1;
    fetchdata(token1)
    if(ownershiprenounced === true && ownermodifiable === false && cannotsellall === false && honeypotwithsamecreator === false && ismintable === false && ishoneypot === false && isopensource === true && buytax === false && selltax === false && transferpausable === false && tradingcooldown === false){
      //swap(token1, amountout, amountin);
      console.log('token bought at ', eachtokenbuy)
      boughttoken = true;
    }
  }

  if(token1 == addresses.WETH) {
    tokenIn = token1; 
    tokenOut = token0;
    fetchdata(token0)
    //add condition checkers
    //call swap
    //swap(token1, amountout, amountin);
    if(ownershiprenounced === true && ownermodifiable === false && cannotsellall === false && honeypotwithsamecreator === false && ismintable === false && ishoneypot === false && isopensource === true && buytax === false && selltax === false && transferpausable === false && tradingcooldown === false){
      //swap(token1, amountout, amountin);
      console.log('token bought at ', eachtokenbuy)
      boughttoken = true;
    }
  }

  //The quote currency is not WETH
  if(typeof tokenIn === 'undefined') {
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
    token0: 'token0',
    token1: 'token1',
    pairAddress: 'pairAddress',
    tokenaddress: tokenOut,
    ownershiprenounced: ownershiprenounced,
    ownermodifiable: ownermodifiable,
    cannotsellall: cannotsellall,
    creatorpercent: creatorpercent,
    hiddenowner: hiddenowner,
    honeypotwithsamecreator: honeypotwithsamecreator,
    isantiwhale: isantiwhale,
    isblacklisted: isblacklisted,
    ismintable: ismintable,
    ishoneypot: ishoneypot,
    contractverified: isopen_source,
    transferpausable: transferpausable,
    tradingcooldown: tradingcooldown,
    tokensymbol: tokensymbol,
    tokenname: tokenname,
    selltax: selltax,
    buytax: buytax,
    antiwhalemodifiable: antiwhalemodifiable,
    bought: boughttoken,
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

});*/
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
 //token name
 //opensource
 
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
//for each check timer or counter get price and our live balance 
//code to pause swapping of tokens on smart contract
//don't forget buy json element

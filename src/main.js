import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import BigNumber from "bignumber.js";
import guessinggameABI from "../contract/guessinggame.abi.json";
import erc20Abi from "../contract/erc20.abi.json";

const ERC20_DECIMALS = 18;
const GGCAddress = "0xd02939a969dff64A8569819020CB3c86a7Af86b7";
const cUSDContractAddress = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1";

let kit
let contract
let gameHistory = []

const connectCeloWallet = async function () {
    if (window.celo) {
        notification("⚠️ Please approve this DApp to use it.")
      try {
        await window.celo.enable()
        notificationOff()
  
        const web3 = new Web3(window.celo)
        kit = newKitFromWeb3(web3)

        const accounts = await kit.web3.eth.getAccounts()
         kit.defaultAccount = accounts[0];
         contract = new kit.web3.eth.Contract(guessinggameABI, GGCAddress);
  
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    } else {
      notification("⚠️ Please install the CeloExtensionWallet.")
    }
  }


const getGameHistory = async function(){
    const games = [];
    const _pastGames = await contract.methods.getPlayerLastGame().call();
    let index = 0;
    _pastGames.forEach(element => {
        let _game = new Promise(async(resolve, reject) => {
            resolve({
                id : index,
                isCurrentSession : element.isCurrentSession,
                round_count : element.round_count,
                round_no: element.round_no,
                score : element.score,
                unitReward : new BigNumber(element.unitReward),
                words : element.words
            });        
        })
        games.push(_game); 
        index++; 
    });     
   
    gameHistory = await Promise.all(games);
    renderGameBoard();    
} 

const getBalance = async function () {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
    document.querySelector("#balance").textContent = cUSDBalance;
}

function renderGameBoard() {
    document.getElementById("gameboard").innerHTML = "";
    gameHistory.forEach(game => {
        const newDiv = document.createElement("div");
        newDiv.className = "col-md-4";
        newDiv.innerHTML = gameTemplate(game);
        document.getElementById("gameboard").appendChild(newDiv);        
    });
}

function gameTemplate(game) {
    return `
      <div class="card mb-4">        
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
          Score: ${game.score} out of ${game.round_count}
        </div>
        <div class="card-body text-left p-4 position-relative">      
        <h2 class="card-title fs-4 fw-bold mt-2">Reward ${game.unitReward.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</h2>
        <p class="card-text mb-4" style="min-height: 82px">
        ${wordsTemplate(game.words)}           
        </p>
        <div>${playTemplate(game, game.id)} </div>        
      </div>
    </div>
  `
}

function  wordsTemplate(words){
    const para = document.createElement("div");
    para.innerHTML = "Words in the game are: ";  
    let index = 0
    words.forEach(word => {
        const span = document.createElement("span");
        span.className = "ml-3";
        span.innerHTML = `${index+1}. <b>${word} </b>`;
        para.appendChild(span);
        index++;        
    });
    return para.innerHTML;
}
function playTemplate(game, id){ 
    if(game.isCurrentSession){
        const containerDiv = document.createElement("div");        
        let div = document.createElement("div");
        div.className="d-grid gap-2";        
        containerDiv.appendChild(div);

        const select =  document.createElement("select");
        select.id = `word_option${id}`;
        select.className = "form-select form-select-sm";
        select.innerHTML = `<option>Choose word to play with</option>`;
         game.words.forEach(word => {
             const option = document.createElement("option");
             option.value = word;
             option.innerText = word;
             select.appendChild(option);             
         }); 

         div.appendChild(select);
         const playBtnDiv = document.createElement("div");
         playBtnDiv.className="d-grid gap-2";
         playBtnDiv.innerHTML=`<a class="btn btn-lg btn-outline-dark playBtn fs-6 p-3" id=${id}>
                                    Play for  ${game.unitReward.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
                                </a>`;                                
        div.appendChild(playBtnDiv);
        return containerDiv.innerHTML;        
    }
    else return "";
}

function notification(_text) {
    document.querySelector(".alert").style.display = "block"
    document.querySelector("#notification").textContent = _text
  }
  
function notificationOff() {
document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
notification("⌛ Loading...")
await connectCeloWallet();
await getGameHistory();
await getBalance();
// renderGameBoard()
notificationOff()
});

document
  .querySelector("#newGameBtn")
  .addEventListener("click", async () => {
    let words = (document.getElementById("words").value).split(",").filter(word => word); // adds only non-nulll values to the word list
    const params = [
        words,
        document.getElementById("roundCount").value.toString(),
        new BigNumber(document.getElementById("amount").value).shiftedBy(ERC20_DECIMALS).toString()
    ];
    notification(`⌛ Starting a new game session...`);
    try {
        const result = await contract.methods
          .startGameWithCelo(...params)
          .send({ from: kit.defaultAccount });          
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
    notification(`🎉 You started a new game session.`) 
    getGameHistory();
    getBalance();      
  });

async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

    const result = await cUSDContract.methods
        .approve(GGCAddress, _price)
        .send({ from: kit.defaultAccount });
    return result;
}

document.querySelector("#gameboard").addEventListener("click", async (e) => {    
    if (e.target.className.includes("playBtn")) {
      const index = e.target.id;
      const selectedWord = document.getElementById(`word_option${index}`).value;          
      if(!(gameHistory[index].words.includes(selectedWord))){
        return notification(`⚠️ No word selected. Please select one of the words`);       
      }
      notification("⌛ Waiting for payment approval...")
      try {
        await approve(gameHistory[index].unitReward);
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`⌛ Awaiting payment for the game...`)
        try {            
            const _result = await contract.methods
                .playGame(selectedWord)
                .send({ from: kit.defaultAccount });          
            
            let playedRoundEvent = _result.events.PlayedRound.returnValues;              
                  
            if(playedRoundEvent.won == true){
               notification(`🎉YAY! You WON.`) 
            }
            else{
                notification(`😔 You lost this round! The right word was ${playedRoundEvent.randomWord}.`)
            }            
            getGameHistory();
            getBalance();
        } catch (error) {
        notification(`⚠️ ${error}.`);
        }
    }
})




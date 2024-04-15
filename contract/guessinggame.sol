// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract GuessingGame {
    struct Game {
        string[] words;
        int round_no;
        uint round_count;
        uint score;
        bool isCurrentSession;
        uint unitReward;
    }
    address internal cUsdTokenAddress = 0x765de816845861e75a25fca122bb6898b8b1282a;
    mapping ( address =>  Game[]) games;
    address  owner;

    constructor(){        
        owner = msg.sender;
    }

    event PlayedRound(
        string randomWord,
        bool won,
        uint256 amountWon
    );

    // start a new game
    function startGameWithCelo(string[] memory _words, uint8 _round_no, uint256 amount) public {
        require(amount>0, "amount must be greater than 0");     
        uint256 _unitReward = SafeMath.div(amount, _round_no); 
        //if the player has any game in progress before, end the previous game
        if(games[msg.sender].length > 0){
            Game[] storage g = games[msg.sender]; 
            Game storage latestGame = (games[msg.sender])[g.length - 1];
            latestGame.isCurrentSession = false;
        }      
        games[msg.sender].push(Game(_words, int(uint(_round_no)), 0, 0, true, _unitReward));     
        
    }

    // get list of all games created by current user
    function getPlayerLastGame() public view returns(Game[] memory g){
        return games[msg.sender];
    }

    // play a game using @_word
    function playGame(string memory _word) external payable {
        Game[] storage g = games[msg.sender]; 
        Game storage currentGame = g[g.length - 1];
        require((g.length != 0 ) && (currentGame.isCurrentSession), "Error: NO ongoing game, create a new round");
        require(IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender, address(this),  currentGame.unitReward
        ), "failed to credit tokens into game");
        currentGame.round_count++;
        // uint randomNo = getRandomNo(g.length);
        uint randomNo = createRandom(g.length);
        string memory randomWord = currentGame.words[randomNo];
        if(currentGame.round_no - 1 == 0){
            currentGame.isCurrentSession = false;
        } 

        if(hashCompareWithLengthCheck(_word, randomWord) == true){
            IERC20Token(cUsdTokenAddress).transfer(msg.sender, currentGame.unitReward);           
            currentGame.score++; 
            currentGame.round_no --; 
            emit PlayedRound(
                randomWord,
                true, 
                currentGame.unitReward
            );
        } else { 
            IERC20Token(cUsdTokenAddress).transfer(owner, currentGame.unitReward);
            currentGame.round_no--; 
             emit PlayedRound(
                randomWord,
                false, 
                currentGame.unitReward
            ) ; 
        }
    }

    
    // helper function to return a random number 
    function createRandom(uint number) public view returns(uint){
        return uint(blockhash(block.number-1)) % number;
    }

    //compare string 
    function hashCompareWithLengthCheck(string memory a, string memory b) internal pure returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
}
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";

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

    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    //mapping(uint256 => Game[]) games;

    mapping(uint256 => Game) gameIdToGame;
    mapping(uint256 => address) gameIdToOwner;
    address owner;
    uint256 public gameCount;

    constructor() {
        owner = msg.sender;
        gameCount = 0;
    }

    event PlayedRound(string randomWord, bool won, uint256 amountWon);
    event GameCreated(address gameOwner, string[] words, uint8 roundNumber, uint256 reward);

    // start a new game
    function startGameWithCelo(string[] memory _words, uint8 _round_no, uint256 amount) public {
        require(amount > 0, "amount must be greater than 0");
        uint256 _unitReward = Math.div(amount, _round_no);

        if(gameCount != 0){
           Game storage latestGame = gameIdToGame[gameCount];
           if(latestGame.isCurrentSession){
                revert "Game in Session";
           }
        }
        gameCount++;
        gameIdToOwner[gameCount] = msg.sender;
        gameIdToGame[gameCount] = Game(_words, int(uint(_round_no)), 0, 0, true, _unitReward)

        emit GameCreated(msg.sender, _words, _round_no, amount);
    }

    // get list of all games created by current user
    function getPlayerLastGame() public view returns (Game[] memory g) {
        return games[msg.sender];
    }

    // play a game using @_word
    function playGame(string memory _word) external payable {
        Game storage currentGame = gameIdToGame[gameCount];

        require((currentGame.isCurrentSession), "Error: NO ongoing game, create a new round");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(msg.sender, address(this), currentGame.unitReward),
            "failed to credit tokens into game"
        );

        currentGame.round_count++;
        uint randomNo = createRandom(g.length);
        string memory randomWord = currentGame.words[randomNo];

        if (currentGame.round_no - 1 == 0) {
            currentGame.isCurrentSession = false;
        }

        if (hashCompareWithLengthCheck(_word, randomWord) == true) {
            IERC20Token(cUsdTokenAddress).transfer(msg.sender, currentGame.unitReward);
            currentGame.score++;
            currentGame.round_no--;
            emit PlayedRound(randomWord, true, currentGame.unitReward);
        } else {
            IERC20Token(cUsdTokenAddress).transfer(owner, currentGame.unitReward);
            currentGame.round_no--;
            emit PlayedRound(randomWord, false, currentGame.unitReward);
        }
    }

    // helper function to return a random number
    function createRandom(uint number) public view returns (uint) {
        return uint(blockhash(block.number - 1)) % number;
    }

    // compare string
    function hashCompareWithLengthCheck(string memory a, string memory b) internal pure returns (bool) {
        if (bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
    }
}
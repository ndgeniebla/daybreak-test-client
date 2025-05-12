const gameLobbyId = document.querySelector(".gameLobbyId");
const gameScene = document.querySelector(".gameScene");
const startGameButton = document.querySelector(".startGame");

socket.on("startGame", (startEntities) => {
    console.log(startEntities);
    players = startEntities.playerDetails;
    console.log(players);
    gameBoard = startEntities.board;
    
    //get this client's own player details
    playerDetails = players[playerId];
    
    //set default player positions to 0
    for (const player in players) {
        playerPositions[player] = 0;
    }
    console.log(playerPositions);
    
    console.log("startGamememememem");
    const lobbyScreen = document.querySelector(".lobbyScreen");
    lobbyScreen.classList.add("displayNone");
    gameScene.classList.remove("displayNone");
    gameLobbyId.textContent = joinedLobbyId;
    
    createBoard();
    mapBoard(gameBoard);
    mapBoardEntities();
})

startGameButton.addEventListener("click", e => {
    socket.emit("startGame");
})

//Start of Player Controls

const endTurnButton = document.querySelector(".endTurn");
const playerControls = Array.from(document.querySelectorAll(".playerControls"));
const playerStatus = Array.from(document.querySelectorAll(".playerStatus"));
const moveBtn = document.querySelector(".movePlayer");
const diceNum = document.querySelector(".diceNum");
const drawCardBtn = document.querySelector(".drawCard");

function endTurn() {
    isTurn = false;
    socket.emit("nextTurn");
    disablePlayerControls();
    clearLog();
}

endTurnButton.addEventListener("click", e => {
    socket.emit("playerDrawsCard");
    endTurn()
});

socket.on("startTurn", () => {
    if (!isDead) {
        isTurn = true;
        console.log("your turn has started")
        enablePlayerControls();
        clearLog();
        hasMoved = false;
    }
})

moveBtn.addEventListener("click", e => {
    if (!hasMoved) {
        const rollResult = Math.floor(Math.random() * 6) + 1;
        socket.emit("rollDice", rollResult);
        diceNum.textContent = `You rolled a ${rollResult}`;
        moveBtn.disabled = true;
        hasMoved = true;
    }
})

// Drawing Cards
drawCardBtn.addEventListener("click", e => {
    socket.emit("playerDrawsCard");
})

socket.on("playerDrawsCard", cardName => {
    playerDetails._hand.push(cardName);
    const card = createCard(cardName);

    //disable if passive card or not player turn
    if (cardName === "deny" || cardName === "twc" || isTurn === false) {
        card.disabled = true;
    }

    const hand = document.querySelector(".hand");
    hand.append(card);
});


// Card Event Delegator
const cardHandlers = {
    "swap": swap, 
    "trap": trap, 
    "steal": steal, 
    "sabotage": sabotage, 
    "twc": twc, 
    "dash": dash, 
    "mirror": mirror, 
    "fortune": fortune, 
    "deny": deny
};

const hand = document.querySelector(".hand");
hand.addEventListener("click", e => {
    for (const cardName of e.target.classList) {
        const cardHandler = cardHandlers[cardName];
        if (cardHandler) {
            // directly using the cards automatically means that they're never mirrored versions.
            cardHandler(e, [], false);
            removeCardFromHand(cardName);
            break;
        }
    }
})

// get states of all players after monster takes its turn
socket.on("syncPlayerDetails", serverPlayerDetails => {
    players = serverPlayerDetails;
})


// used for forcefully syncing client's hand to the server if client-side hand was tampered with.
socket.on("syncPlayerHand", cards => {
    playerDetails._hand = cards;
})

socket.on("syncBoard", serverBoard => {
    gameBoard = serverBoard;
    mapBoard();
})

function removeCardFromHand(cardName) {
    const cardIndex = playerDetails._hand.indexOf(cardName);
    if (cardIndex) {
        playerDetails._hand.splice(cardIndex, 1);
    }
}




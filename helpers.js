
const cardCosts = {
    "swap": 3, 
    "trap": 1, 
    "steal": 1, 
    "sabotage": 1, 
    "twc": 3, 
    "dash": 2, 
    "mirror": 1, 
    "fortune": 1, 
    "deny": 2,
};


function createCard(cardName) {
    const card = document.createElement("button");
    card.classList.add("card");
    card.classList.add(cardName);
    card.textContent = `${cardName} [${cardCosts[cardName]}]`;
    return card;
}

function createTile(tileNum) {
    const tile = document.createElement("div");

    const tileOrder = document.createElement("div");
    const players = document.createElement("div");
    const monster = document.createElement("div");
    const tileDetails = document.createElement("div");

    tileOrder.textContent = tileNum;

    tile.classList.add("tile");
    tile.dataset.num = tileNum;

    players.classList.add("players");
    players.textContent = " ";
    
    tileDetails.classList.add("monsterContainer");
    monster.classList.add("tileDetails");
    
    tile.append(tileOrder);
    tile.append(players);
    tile.append(monster);
    tile.append(tileDetails);
    
    return tile;
}


function createBoard() {
    const board = document.querySelector(".board");
    for (let i = 0; i < gameBoard.length; i++) {
        board.append(createTile(i));
    }
}

function mapBoard() {
    const board = Array.from(document.querySelector(".board").children);
    console.log(board);
    for (let i = 0; i < board.length; i++) {
        const tile = board[i];
        const details = tile.querySelector(".tileDetails");
        const serverTile = gameBoard[i];
        if (serverTile.badTile) {
            tile.classList.add("badTile");
        } 

        if (serverTile.trap) {
            tile.classList.add("trapTile");
        } else {
            tile.classList.remove("trapTile");
        }

        details.textContent = JSON.stringify(gameBoard[i]);
    }
}

//also acts as a refresh for player positions
function mapBoardEntities() {
    const board = Array.from(document.querySelector(".board").children);
    for (let i = 0; i < board.length; i++) {
        const tile = board[i];
        const playersOnTile = tile.querySelector(".players");
        playersOnTile.textContent = "";
        for (const [pid, pos] of Object.entries(playerPositions)) {
            if (pos === i) {
                const player = players[pid];
                const playerMarker = document.createElement("p");
                playerId === pid ? playerMarker.classList.add("you") : playerMarker.classList.add("other");
                playerMarker.textContent = `[${player._displayName} (${player._character})]` 
                playersOnTile.append(playerMarker);
            }
        }
    }
    
    if (monsterPos !== -1) {
        const monTile = board[monsterPos];

        for (let i = 0; i < monsterPos; i++) {
            const deathTile = board[i];
            deathTile.classList.add("death");
            const deathTileMon = deathTile.querySelector(".monsterContainer");
            deathTileMon.textContent = "";
        }

        const monCont = monTile.querySelector(".monsterContainer");
        monTile.classList.add("death");
        monCont.textContent = "MONSTER";
    }
    
}

function logMsg(msg) {
    const log = document.querySelector(".log");
    log.textContent = msg;
}

function clearLog() {
    const log = document.querySelector(".log");
    const targetPlayerButtons = document.querySelector(".targetPlayers");
    log.textContent = "";
    targetPlayerButtons.innerHTML = "";
}

function disablePlayerControls() {
    const playerControls = Array.from(document.querySelectorAll(".playerControls"));
    const cards = Array.from(document.querySelectorAll(".card"));
    const playerStatus = Array.from(document.querySelectorAll(".playerStatus"));

    playerControls.forEach(btn => btn.disabled = true);
    playerStatus.forEach(status => status.innerHTML = "");
    cards.forEach(card => card.disabled = true);
}

function disablePassiveCards() {
    console.log("disablePassiveCards")
    const cards = Array.from(document.querySelectorAll(".card"));
    console.log("cards", cards)
    cards.forEach(card => {
        const passiveCards = ["deny", "twc"];
        passiveCards.some(passive => card.classList.contains(passive)) ? card.disabled = true : card.disabled = false; 
    });
}

function enablePlayerControls() {
    const playerControls = Array.from(document.querySelectorAll(".playerControls"));
    const cards = Array.from(document.querySelectorAll(".card"));

    playerControls.forEach(btn => btn.disabled = false);
    cards.forEach(card => card.disabled = false);
    disablePassiveCards();
}

function createDenyCancelButton(event, instigator) {
    const denyCancelCont = document.querySelector(".denyCancelCont");
    const denyButton = document.createElement("button");
    denyButton.textContent = "Cancel";
    denyButton.addEventListener("click", e => {
        const playerInstigator = players[instigator];
        socket.emit(event, instigator);
        denyCancelCont.innerHTML = "";
        const msg = {
            "swapPlayers": `${playerInstigator._displayName} (${playerInstigator._character}) swaps positions with you.`,
            "playerCardStolen": `${playerInstigator._displayName} (${playerInstigator._character}) steals a card from you.`,
            "playerSabotaged": `${playerInstigator._displayName} (${playerInstigator._character}) sabotages you and you move back 3 spaces.`
        }
        logMsg(msg[event]);
        disablePlayerControls();
    })
    
    denyCancelCont.append(denyButton);
}

function enableDenyCards() {
    const denyCards = Array.from(document.querySelectorAll(".deny"));
    denyCards.forEach(card => card.disabled = false);
}

function enableTWCCards() {
    const twcCards = Array.from(document.querySelectorAll(".twc"));
    twcCards.forEach(card => card.disabled = false);
}
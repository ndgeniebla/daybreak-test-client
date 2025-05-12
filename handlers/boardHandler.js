
socket.on("syncPlayerPos", serverPlayerPos => {
    playerPositions = serverPlayerPos;
    mapBoardEntities();
})

socket.on("monsterMoves", monsterDetails => {
    monsterPos = monsterDetails.monsterPos;
    if (monsterDetails.triggerDeath) {
        const log = document.querySelector(".log");
        if (!playerDetails._hand.includes("twc")) {
            log.classList.add("deadMsg");
            logMsg("You died!");
            isDead = true;
            socket.emit("thatWasClose", {cost: [], hand: playerDetails._hand, revive: false});
        } else {
            logMsg("You have a That Was Close card.");
            console.log(playerDetails._hand);
            enableTWCCards();
        }
    } else {
        socket.emit("playerSafe");
        // for players that are not in danger (i.e. game does not need to ask for TWC);
    }
    
    console.log("monsterPos", monsterPos);
    mapBoardEntities();
})

function spinWheel() {
    // lol there's probably a better way to do the chances for this thing. whatever.
    const badEvents = ["moveBack", "moveBack", "moveBack", "loseCard"];
    const event = badEvents[Math.floor(Math.random() * badEvents.length)];
    const tileAmount = Math.floor(Math.random() * 3) + 1;
    if (event === "moveBack") {
        logMsg(`You landed on a bad tile. You move back ${tileAmount} spaces.`)
    } else {
        logMsg(`You landed on a bad tile. You lose a card`);
    }

    socket.emit("spinWheel", {event, tileAmount});
    return event;
}

socket.on("trap", () => {
    endTurn();
    logMsg("You have been trapped! Your turn is skipped.");
})

socket.on("badTile", () => {
    spinWheel();
});

socket.on("badTrap", () => {
    const event = spinWheel();
    endTurn();
    if (event === "moveBack") {
        logMsg(`You landed on a bad tile and are trapped. You move back and your turn is skipped.`)
    } else {
        logMsg(`You landed on a bad tile and are trapped. You lose a card and your turn is skipped`);
    }
});

socket.on("gameEndAllLose", () => {
    const gameStatus = document.querySelector(".gameStatus");
    gameStatus.classList.add("allLose");
    gameStatus.textContent = "GAME OVER";
});
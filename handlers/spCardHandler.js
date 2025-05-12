function trap(e, cost, isMirrored) {
    console.log("trap card used");
    const rollResult = Math.floor(Math.random() * 6) + 1;
    logMsg(`You played a Trap card and rolled a ${rollResult}. Choose tile to trap ${rollResult} spaces away from you:`);
    createTargetTileMenu(rollResult, [], isMirrored);
    disablePlayerControls();
    if (e) e.target.remove();
}

function twc(e, cost) {
    console.log("That Was Close card used");
    logMsg(`That was close! You dodged the monster.`);
    disablePlayerControls();
    socket.emit("thatWasClose", {cost: [], hand: playerDetails._hand, revive: true});
    isDead = false;
    if (e) e.target.remove();
}

function dash(e, cost, isMirrored) {
    console.log("dash card used");
    socket.emit("playerPlaysCard", {cardName: "dash", cost, hand: playerDetails._hand, isMirrored})
    logMsg(`You dash forward 3 spaces.`);
    if (e) e.target.remove();
}

function mirror(e, cost) {
    console.log("mirror card used");
    // Mirror card cannot ever be mirrored.
    socket.emit("playerPlaysCard", {cardName: "mirror", cost, hand: playerDetails._hand, isMirrored: false})
    if (e) e.target.remove();
}

function fortune(e, cost, isMirrored) {
    console.log("fortune card used");
    const rollResult = Math.floor(Math.random() * 6) + 1;
    const moveResult = rollResult % 2 === 0 ? "You move forward 4 spaces" : "You move back -2 spaces."
    socket.emit("playerPlaysCard", {cardName: "fortune", cost, hand: playerDetails._hand, isMirrored, extras: {diceRoll: rollResult}})
    logMsg(`Fortune card was played, and you rolled a ${rollResult}. ${moveResult}`);
    if (e) e.target.remove();
}


function createTargetTileMenu(diceRoll, cost, isMirrored) {
    const targetTiles = document.querySelector(".targetTiles");
    const playerPos = playerPositions[playerId];

    targetTiles.innerHTML = "";

    for (let tileIndex = Math.max(playerPos - diceRoll, 0); 
        tileIndex < Math.min(playerPos + diceRoll + 1, gameBoard.length - 1); 
        tileIndex++) {
        if (tileIndex === playerPos) continue;
        const button = document.createElement("button");
        button.textContent = tileIndex;
        button.addEventListener("click", e => {
            trapTile(diceRoll, tileIndex, cost, isMirrored);
            targetTiles.innerHTML = "";
            clearLog();
            enablePlayerControls();
        })
        targetTiles.append(button);
    }

}

function trapTile(rollResult, tileIndex, cost, isMirrored) {
    socket.emit("playerPlaysCard", {cardName: "trap", cost, hand: playerDetails._hand, isMirrored, extras: {diceRoll: rollResult, tileToTrap: tileIndex}});
}
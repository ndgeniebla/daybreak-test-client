function swap(e, cost, isMirrored) {
    console.log("swap card used");

    logMsg(`You played a Swap card. Choose your target:`);
    createTargetMenu();
    attachTargetAction("swap", cost, isMirrored);
    
    if (e) e.target.remove();
}

function steal(e, cost, isMirrored) {
    console.log("steal card used");
    logMsg(`You played a Steal card. Choose your target:`);
    createTargetMenu();
    attachTargetAction("steal", cost, isMirrored);
    if (e) e.target.remove();
}

function sabotage(e, cost, isMirrored) {
    console.log("sabotage card used");
    logMsg(`You played a Sabotage card. Choose your target:`);
    createTargetMenu();
    attachTargetAction("sabotage", cost, isMirrored);
    if (e) e.target.remove();
}

let denyFunc = function() {
    logMsg("Deny was played outside of a Deny Transaction. Behaviour unknown.")
};

function deny(e, cost) {
    const denyCancelCont = document.querySelector(".denyCancelCont");
    denyCancelCont.innerHTML = "";

    // denyFunc has different behaviour depending on what card is being denied and is redefined accordingly.
    logMsg("You denied successfully.");
    denyFunc();

    disablePlayerControls();

    //reset denyFunc just in case player plays Deny outside of transaction.
    denyFunc = function() {
        logMsg("Deny was played outside of a Deny Transaction. Behaviour unknown.")
    };
    if (e) e.target.remove();
}

// Deny handling for all mp cards
socket.on("playSwap", (playerInstigatorId) => {
    logMsg("You've been targeted for Swap");
    if (!playerDetails._hand.includes("deny")) {
        const playerInstigator = players[playerInstigatorId];
        logMsg(`You do not have any deny cards. ${playerInstigator._displayName} (${playerInstigator._character}) swaps positions with you.`);
        socket.emit("swapPlayers", playerInstigatorId);
    } else {
        logMsg("You have a deny card. Use it to deny Swap?");
        createDenyCancelButton("swapPlayers", playerInstigatorId);
        enableDenyCards();
        denyFunc = function() {
            socket.emit("playDeny", { cardName: "swap", cost: [], hand: playerDetails._hand, playerInstigatorId });
        }
    }
})

socket.on("playSteal", (playerInstigatorId) => {
    logMsg("You've been targeted for Steal");
    if (!playerDetails._hand.includes("deny")) {
        const playerInstigator = players[playerInstigatorId];
        logMsg(`You do not have any deny cards. ${playerInstigator._displayName} (${playerInstigator._character}) steals a card from you.`);
        socket.emit("playerCardStolen", playerInstigatorId);
    } else {
        logMsg("You have a deny card. Use it to deny Steal?");
        createDenyCancelButton("playerCardStolen", playerInstigatorId);
        enableDenyCards();
        denyFunc = function() {
            socket.emit("playDeny", { cardName: "steal", cost: [], hand: playerDetails._hand, playerInstigatorId });
        }
    }
})

socket.on("playSabotage", (playerInstigatorId) => {
    logMsg("You've been targeted for Sabotage");
    if (!playerDetails._hand.includes("deny")) {
        const playerInstigator = players[playerInstigatorId];
        logMsg(`You do not have any deny cards. ${playerInstigator._displayName} (${playerInstigator._character}) sabotages you and you move back 3 spaces.`);
        socket.emit("playerSabotaged", playerInstigatorId);
    } else {
        logMsg("You have a deny card. Use it to deny Sabotage?");
        createDenyCancelButton("playerSabotaged", playerInstigatorId);
        enableDenyCards();
        denyFunc = function() {
            socket.emit("playDeny", { cardName: "sabotage", cost: [], hand: playerDetails._hand, playerInstigatorId });
        }
    }
})
//==============================


// message the instigator the state of their mp card
socket.on("playerPlaysDeniable", (result) => {
    const { cardName, success, victim } = result;
    const victimPlayer = players[victim];
    if (success) {
        console.log("playerPlaysDeniable response: success")
        switch (cardName) {
            case "swap":
                logMsg(`You swapped places with ${victimPlayer._displayName}.`)
                break;
            case "steal":
                logMsg(`You stole ${victimPlayer._displayName}'s card.`)
                break;
            case "sabotage":
                logMsg(`You sabotaged ${victimPlayer._displayName}.`)
                break;
            default:
                logMsg(`Your card was successful.`)
                break;
        }
    } else {
        console.log("playerPlaysDeniable response: denied")
        switch (cardName) {
            case "swap":
                logMsg(`${victimPlayer._displayName} denied your Swap card.`)
                break;
            case "steal":
                logMsg(`${victimPlayer._displayName} denied your Steal card.`)
                break;
            case "sabotage":
                logMsg(`${victimPlayer._displayName} denied your Sabotage card.`)
                break;
            default:
                logMsg(`Your card got denied.`)
                break;
        }
    }
    enablePlayerControls();
});


socket.on("playerLosesCard", (cardName) => {
    console.log(playerDetails._hand);
    const removeCardIndex = playerDetails._hand.indexOf(cardName);
    console.log(removeCardIndex);
    const cards = Array.from(document.querySelectorAll(".card"));
    console.log("playerLosesCard", cardName);
    
    //index could be zero so explictly checking for undefined in this case
    if (removeCardIndex !== undefined) {
        playerDetails._hand.splice(removeCardIndex, 1);
        console.log("playerLosesCard", cardName);
        renderCardToRemove = cards.find(card => card.classList.contains(cardName));
        console.log(renderCardToRemove);
        renderCardToRemove.remove();
    }
});



// Create interface for Targeted Cards
function createTargetButton(playerId) {
    const button = document.createElement("button");
    const targetPlayer = players[playerId];
    button.dataset.targetId = playerId;
    button.textContent = `${targetPlayer._displayName} (${targetPlayer._character})`;
    return button;
}

function createTargetMenu() {
    const targetPlayers = document.querySelector(".targetPlayers");
    targetPlayers.innerHTML = "";
    console.log(players);
    console.log("current player id", playerId);

    for (const pid in players) {
        const player = players[pid];
        console.log(player._playerId, "dead", player._isDead);
        if (!player._isDead && player._playerId !== playerId) {
            console.log("add target");
            const targetButton = createTargetButton(player._playerId);
            targetPlayers.append(targetButton);
        }
    }
}

function attachTargetAction(cardName, cost, isMirrored) {
    const targetPlayerButtons = Array.from(document.querySelector(".targetPlayers").children);
    targetPlayerButtons.forEach(button => {
        console.log("attaching listeners", button.dataset.targetId);
        button.addEventListener("click", e => {
            const targetPlayer = players[button.dataset.targetId];
            console.log(cardName);
            socket.emit("playerPlaysDeniable", {cardName, cost, hand: playerDetails._hand, target: button.dataset.targetId, isMirrored});
            clearLog();
            switch(cardName) {
                case "swap":
                    logMsg(`Waiting for ${targetPlayer._displayName} to counter...`)
                    break;
                case "steal":
                    logMsg(`You reached into ${targetPlayer._displayName}'s stash... will they let it slide?`)
                    break;
                case "sabotage":
                    logMsg(`Waiting for ${targetPlayer._displayName} to deny...`);
                    break;
            }
            
            disablePlayerControls();
        })
    });
}
characterBtnClasses = [
    "moosy",
    "egbert",
    "crowly",
    "spike",
    "carotina",
    "grog",
];

//something something event delegation don't care this is for testing purposes blah blah blah
characterBtnClasses.forEach(character => {
    const characterBtn = document.querySelector(`.characterBtns .${character}`);
    characterBtn.addEventListener("click", e => {
        socket.emit("selectCharacter", character);
    });
});

socket.on("characterSelectStates", characterSelectStates => {
    console.log(characterSelectStates);
    for (const character in characterSelectStates) {
        const characterBtn = document.querySelector(`.characterBtns .${character}`);
        
        const playerSelectedCharacter = characterSelectStates[character];
        if (playerSelectedCharacter && playerId !== playerSelectedCharacter){ 
            characterBtn.disabled = true
            characterBtn.classList.add("characterTaken");
        } else {
            characterBtn.disabled = false;
            characterBtn.classList.remove("characterTaken");
        }
        
        if (playerId === playerSelectedCharacter) {
            characterBtn.classList.add("characterSelected");
        } else {
            characterBtn.classList.remove("characterSelected");
        }
    }
})

const nicknameInput = document.querySelector(".nicknameInput");
let debounceTimeout;

nicknameInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);

    const value = e.currentTarget.value;
    
    debounceTimeout = setTimeout(() => {
        console.log("setPlayerNickname", value);
        socket.emit("setPlayerNickname", value);
    }, 250);
});

const readyButton = document.querySelector(".readyButton");

let isReady = false;

socket.on("playerCanReadyUp", allowedToReady => {
    console.log("allowedToReady", allowedToReady);
    readyButton.disabled = !allowedToReady;
    
    //force unready in case player deselects character or clears their name
    if (!allowedToReady) {
        isReady = false;
        socket.emit("setPlayerReadyState", false);
    }
})


readyButton.addEventListener("click", e => {
    //make ready request toggleable
    isReady = !isReady
    socket.emit("setPlayerReadyState", isReady)
});

socket.on("playerReady", ready => {
    ready ? readyButton.classList.add("playerReady") : readyButton.classList.remove("playerReady");
})

socket.on("allPlayersReady", allPlayersReady => {
    console.log("all players ready:", allPlayersReady)
    allPlayersReady ? startGameButton.classList.remove("displayNone") : startGameButton.classList.add("displayNone")
});



const leaveLobbyBtn = document.querySelector(".leaveLobby");

leaveLobbyBtn.addEventListener("click", e => {
    socket.emit("leaveLobby");
    lobbyDiv.classList.add("displayNone");
});

socket.on("leftLobby", () => {
    lobbyMsg.textContent = "";
    lobbyWideMsg.textContent = "";
    lobbyIdSpan.textContent = "";
    isReady = false;
    readyButton.classList.remove("playerReady")
    socket.emit("getLobbyList");
    Array.from(document.querySelectorAll("input")).forEach(input => input.value = "");
})
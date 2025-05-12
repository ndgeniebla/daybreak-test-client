// const socket = io("http://localhost:3000", {
//     withCredentials: true
// });

await fetch("https://daybreak-server.onrender.com/session", {
    credentials: "include"
});

const socket = io("https://daybreak-server.onrender.com", {
    withCredentials: true,
    transports: ["polling"]
});

let playerId = "";
let playerDetails;

let players;
let playerPositions = {};
let monsterPos = -1;
let isDead = false;
let hasMoved = false;
let isTurn = false;
let gameBoard;

let joinedLobbyId = "";

window.addEventListener("load", e => {
    // Array.from(document.querySelectorAll("input")).forEach(input => input.value = "");
    socket.emit("getLobbyList");
    socket.emit("rejoinLobby");
})


socket.on("getPlayerId", pid => {
    playerId = pid;
    document.querySelector(".playerId").textContent = playerId;
}) 

const createLobbyBtn = document.querySelector(".createLobbyBtn");
createLobbyBtn.addEventListener("click", e => {
    console.log("create lobby btn clicked");
    socket.emit("createLobby");
    socket.emit("getLobbyList");
})

const joinLobbyForm = document.querySelector(".joinLobbyForm");
const roomCodeInput = document.querySelector(".roomCodeInput");

joinLobbyForm.addEventListener("submit", e => {
    e.preventDefault();
    console.log(e.currentTarget.value);
    socket.emit("joinLobby", roomCodeInput.value);
    socket.emit("getLobbyList");
});

const lobbiesDiv = document.querySelector(".lobbies");
socket.on("receiveLobbyList", (lobbyList) => {
    console.log(lobbyList)
    lobbiesDiv.innerHTML = "";
    lobbyList.forEach(lobbyDetails => {
        const p = document.createElement("p");
        p.textContent = lobbyDetails;
        lobbiesDiv.append(p);
    })
})

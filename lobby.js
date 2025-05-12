const lobbyDiv = document.querySelector(".currentLobby")
const lobbyIdSpan = document.querySelector(".lobbyId");
socket.on("receiveLobbyId", (lobbyId) => {
    joinedLobbyId = lobbyId;
    lobbyIdSpan.textContent = joinedLobbyId;
    lobbyDiv.classList.remove("displayNone");
})

const pingLobbyBtn = document.querySelector(".pingLobby");
const pingEntireLobbyBtn = document.querySelector(".pingEntireLobby");

pingLobbyBtn.addEventListener("click", e => {
    socket.emit("pingLobby");
})

pingEntireLobbyBtn.addEventListener("click", e => {
    socket.emit("pingEntireLobby");
})


const lobbyMsg = document.querySelector(".lobbyMsg");
// Only works for clients that are currently in a lobby
socket.on("lobbyResponse", msg => {
    lobbyMsg.textContent = msg;
})

const lobbyWideMsg = document.querySelector(".lobbyWideMsg");
socket.on("entireLobbyResponse", msg => {
    lobbyWideMsg.textContent = msg;
});

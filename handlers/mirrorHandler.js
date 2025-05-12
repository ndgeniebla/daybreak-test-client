
// Passive cards (TWC and Deny) and Mirror cannot be mirrored.
socket.on("playerPlaysMirror", lastCard => {
    switch(lastCard) {
        case "swap":
            swap(null, [], true)
            break;
        case "steal":
            steal(null, [], true)
            break;
        case "sabotage":
            sabotage(null, [], true)
            break;
        case "trap":
            trap(null, [], true)
            break;
        case "dash":
            dash(null, [], true)
            break;
        case "fortune":
            fortune(null, [], true)
            break;
        default:
            logMsg("Mirror card failed to play.");
            break;
    }
})
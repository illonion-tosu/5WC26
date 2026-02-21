// Elements
const winnerFlagEl = document.getElementById("winner-flag")
const scoreEl = document.getElementById("score")
const playersEl = document.getElementById("players")

let allTeams
async function initialise() {
    allTeams = await getTeams()
}
const findTeam = teamName => allTeams.find(team => team.country_name.toUpperCase() === teamName.toUpperCase())

initialise();

let currentLeftTeamName, currentRightTeamName
let previousLeftStars, previousRightStars, previousFirstTo
setInterval(() => {
    // No teams
    if (!allTeams) return

    // Set Stars
    let currentLeftStars = Number(getCookie("currentLeftStars"))
    let currentRightStars = Number(getCookie("currentRightStars"))
    let currentFirstTo = Number(getCookie("currentFirstTo"))

    // Update team names and scores if they have changed
    {
        const newLeftTeamName = getCookie("currentLeftTeamName")
        const newRightTeamName = getCookie("currentRightTeamName")

        const teamNamesChanged = newLeftTeamName !== currentLeftTeamName || newRightTeamName !== currentRightTeamName;
        const scoresChanged = currentLeftStars !== previousLeftStars || currentRightStars !== previousRightStars;

        if (teamNamesChanged || scoresChanged) {
            currentLeftTeamName = newLeftTeamName
            currentRightTeamName = newRightTeamName

            // Commit change to team names and scores
            let tempLeftTeamName = currentLeftTeamName
            let tempRightTeamName = currentRightTeamName
            if (tempLeftTeamName.toLowerCase() === "russian federation") tempLeftTeamName = "russia"
            if (tempRightTeamName.toLowerCase() === "united arab emirates") tempRightTeamName = "uae"
            scoreEl.innerText = `${tempLeftTeamName.toUpperCase()} ${currentLeftStars} - ${currentRightStars} ${tempRightTeamName.toUpperCase()}`
        }
    }

    // Check if there is a winner
    let winningTeam
    if (currentLeftStars === currentFirstTo) winningTeam = findTeam(currentLeftTeamName)
    else if (currentRightStars === currentFirstTo) winningTeam = findTeam(currentRightTeamName)

    if (!winningTeam)
        return;

    console.log(winningTeam)

    // Set elements
    // Set Flag
    winnerFlagEl.setAttribute("src", `https://osuflags.omkserver.nl/${winningTeam.flag_code}-600.png`)

    // Set Players
    let noOfPlayers = 0
    for (noOfPlayers; noOfPlayers < winningTeam.current_year.length; noOfPlayers++) {
        playersEl.children[noOfPlayers].style.display = "block"
        playersEl.children[noOfPlayers].innerText = winningTeam.current_year[noOfPlayers].toUpperCase()
    }
    for (noOfPlayers; noOfPlayers < 8; noOfPlayers++) {
        playersEl.children[noOfPlayers].style.display = "none"
    }

    // Store previous scores
    previousLeftStars = currentLeftStars
    previousRightStars = currentRightStars
}, 500)


function setAndJoinTwitchChannel(channelName) {
    const sidebarButtons = document.getElementsByClassName("sidebar-button")
    for (let i = 0; i < sidebarButtons.length; i++) {
        sidebarButtons[i].style.backgroundColor = "transparent"
        sidebarButtons[i].style.color = "var(--main-text)"
    }

    document.cookie = `currentChannel=${channelName}`

    const channelButton = document.getElementById(`twitch-channel-${channelName}`)
    channelButton.style.backgroundColor = "var(--main-text)"
    channelButton.style.color = "var(--secondary-text)"
}
ComfyJS.Init( "5WC2025", null, ["5WC2025", "aquiii", "minusfubukiii"] );
setAndJoinTwitchChannel("5WC2025")

// Twitch Chat
const twitchChatContainer = document.getElementById("twitch-chat-container")
const badgeTypes = ["broadcaster", "mod", "vip", "founder", "subscriber"]
ComfyJS.onChat = ( user, message, flags, self, extra ) => {

    // Get rid of nightbot messages
    if (user === "Nightbot") return

    // Put message in if its the correct ahnenl
    if (getCookie("currentChannel").toLowerCase() === extra.channel.toLowerCase()) {

        // Set up message container
        const twitchChatMessageContainer = document.createElement("div")
        twitchChatMessageContainer.classList.add("twitch-message-container")
        twitchChatMessageContainer.setAttribute("id", extra.id)
        twitchChatMessageContainer.setAttribute("data-twitch-id", extra.userId)

        // Message user
        const messageUser = document.createElement("div")
        messageUser.classList.add("twitch-message-user")
        messageUser.innerText = `${user}:`

        if (!chatColours[user]) generateChatColour(user)
        let chatColour = chatColours[user]
        messageUser.style.color = `rgb(${chatColour.r}, ${chatColour.g}, ${chatColour.b})`

        // Message
        const chatMessage = document.createElement("div")
        chatMessage.classList.add("twitch-message")
        chatMessage.innerText = message

        // Append everything together
        twitchChatMessageContainer.append(messageUser, chatMessage)
        twitchChatContainer.append(twitchChatMessageContainer)
        twitchChatContainer.scrollTop = twitchChatContainer.scrollHeight
    }
}

// Delete message
ComfyJS.onMessageDeleted = (id, extra) => document.getElementById(id).remove()

// Timeout
ComfyJS.onTimeout = ( timedOutUsername, durationInSeconds, extra ) => deleteAllMessagesFromUser(extra.timedOutUserId)

// Ban
ComfyJS.onBan = (bannedUsername, extra) => deleteAllMessagesFromUser(extra.bannedUserId)

// Delete all messages from user
function deleteAllMessagesFromUser(twitchId) {
    const allTwitchChatMessages = Array.from(document.getElementsByClassName("twitchChatMessage"))
    allTwitchChatMessages.forEach((message) => {
        if (message.dataset.twitchId === twitchId) {
            message.remove()
        }
    })
}

// Add twitch channel
const twitchChannelButtonContainerEl = document.getElementById("twitch-channel-button-container")
const twitchChannelInputEl = document.getElementById("twitch-channel-input")
function addTwitchChannel() {
    const twitchChannel = twitchChannelInputEl.value.trim()
    if (twitchChannel === "") return

    // Initialise twitch channel
    ComfyJS.Init(twitchChannel)

    // Make twitch channel button
    const twitchChannelButton = document.createElement("button")
    twitchChannelButton.classList.add("sidebar-button")
    twitchChannelButton.setAttribute("onclick", `setAndJoinTwitchChannel('${twitchChannel}')`)
    twitchChannelButton.setAttribute("id", `twitch-channel-${twitchChannel}`)
    twitchChannelButton.innerText = twitchChannel
    twitchChannelButtonContainerEl.append(twitchChannelButton)
    twitchChannelButton.click()
}

// Generate Colour
let chatColours = {}
function generateChatColour(username) {
    let r, g, b
    let validColour = false

    while (!validColour) {
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)

        // Guard clauses
        if (r === 256 || g === 256 || b === 256) continue
        if (r + g + b >= 400) validColour = true
    }

    chatColours[username] = {"r": r, "g": g, "b": b}
}
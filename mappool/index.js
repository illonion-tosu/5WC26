// Load team stats
let allTeamStats
async function getTeamStats() {
    const response = await fetch("../_data/team-stats.json")
    const responseJson = await response.json()
    allTeamStats = responseJson
}
const findTeamStatsTeam = team_name => allTeamStats.find(team => team.team_name.toLowerCase() === team_name)

// Load osu! api
let osuApi
async function getApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}

// Tiebreaker tile
const tiebreakerTile = document.getElementById("tiebreaker-tile")

// Create a hidden container to hold preloaded images
const preloadContainer = document.createElement('div')
preloadContainer.style.display = 'none'
document.body.appendChild(preloadContainer)

function preloadImage(setId) {
    const img = document.createElement('img')
    img.src = `https://assets.ppy.sh/beatmaps/${setId}/covers/cover.jpg`
    preloadContainer.appendChild(img)
}

const mappoolManagementSystemButtonContainer = document.getElementById("mappool-management-system-button-container")
let currentBestOf = 0, currentFirstTo = 0, currentLeftStars = 0, currentRightStars = 0, currentScoreDelta = 0
let allBeatmaps, currentMappoolBeatmap, previousMappoolBeatmap
let mapId, mapChecksum
let mapPickTileHeight = 0
async function getBeatmaps() {
    const response = await fetch("../_data/beatmaps.json")
    const responseJson = await response.json()
    allBeatmaps = responseJson.beatmaps

    // Preload all beatmap background images into browser cache
    allBeatmaps.forEach(beatmap => preloadImage(beatmap.beatmapset_id))

    switch (responseJson.roundName) {
        case "ROUND OF 32": case "ROUND OF 16":
            currentBestOf = 9; break;
        case "QUARTERFINALS": case "SEMIFINALS":
            currentBestOf = 11; break;
        case "FINALS": case "GRAND FINALS":
            currentBestOf = 13; break;
    }
    currentFirstTo = Math.ceil(currentBestOf / 2)

    createStarDisplay()

    currentFirstTo = Math.ceil(currentBestOf / 2)
    mapPickTileHeight = 803 / (currentFirstTo - 1)

    for (let i = 0; i < currentFirstTo - 1; i++) {
        redPickMapContainerEl.append(createPickTile(mapPickTileHeight))
        bluePickMapContainerEl.append(createPickTile(mapPickTileHeight))
    }

    for (let i = 0; i < allBeatmaps.length; i++) {
        mappoolManagementSystemButtonContainer.append(createMappoolManagementButton(allBeatmaps[i]))
    }

    const tiebreakerMapJson = allBeatmaps[allBeatmaps.length - 1]
    tiebreakerTile.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${tiebreakerMapJson.beatmapset_id}/covers/cover.jpg")`
    tiebreakerTile.children[1].innerText = responseJson.roundName
    tiebreakerTile.children[2].innerText = `${tiebreakerMapJson.artist} - ${tiebreakerMapJson.title}`

    const tiebreakerImage = new Image()
    tiebreakerImage.crossOrigin = "Anonymous"

    tiebreakerImage.onload = function () {
        // Top Left
        const avgColorTopLeft = getTopLeftAvgRGB(tiebreakerImage)
        const avgTotalTopLeft = (avgColorTopLeft.r + avgColorTopLeft.g + avgColorTopLeft.b) / 3
        if (avgTotalTopLeft <= 150) tiebreakerTile.children[0].style.color = "white"

        // Round Name
        const roundNameWidth = tiebreakerTile.children[1].getBoundingClientRect().width
        const avgColorRoundName = getRoundNameAvgRGB(tiebreakerImage, roundNameWidth)
        const avgTotalRoundName = (avgColorRoundName.r + avgColorRoundName.g + avgColorRoundName.b) / 3
        if (avgTotalRoundName <= 150) tiebreakerTile.children[1].style.color = "white"

        // Bottom Right
        const bottomRightWidth = tiebreakerTile.children[2].getBoundingClientRect().width
        const avgColorBottomRight = getBottomRightAvgRGB(tiebreakerImage, bottomRightWidth)
        const avgTotalBottomRight = (avgColorBottomRight.r + avgColorBottomRight.g + avgColorBottomRight.b) / 3
        if (avgTotalBottomRight <= 150) tiebreakerTile.children[2].style.color = "white"
    }

    tiebreakerImage.src = `https://api.codetabs.com/v1/proxy?quest=https://assets.ppy.sh/beatmaps/${tiebreakerMapJson.beatmapset_id}/covers/cover.jpg`
}

// Create Star Display
const leftTeamStarContainerEl = document.getElementById("left-team-star-container")
const rightTeamStarContainerEl = document.getElementById("right-team-star-container")
function createStarDisplay() {
    document.cookie = `currentLeftStars=${currentLeftStars}; path=/`
    document.cookie = `currentRightStars=${currentRightStars}; path=/`
    document.cookie = `currentBestOf=${currentBestOf}; path=/`
    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
    
    leftTeamStarContainerEl.innerHTML = ""

    console.log(currentBestOf, currentFirstTo, currentLeftStars, currentRightStars)
    rightTeamStarContainerEl.innerHTML = ""

    let i = 0
    for (i; i < currentLeftStars; i++) leftTeamStarContainerEl.append(createStar("full"))
    for (i; i < currentFirstTo; i++) leftTeamStarContainerEl.append(createStar("empty"))

    i = 0
    for (i; i < currentRightStars; i++) rightTeamStarContainerEl.append(createStar("full"))
    for (i; i < currentFirstTo; i++) rightTeamStarContainerEl.append(createStar("empty"))

    // Create Star
    function createStar(status) {
        const newStar = document.createElement("img")
        newStar.classList.add("team-stard")
        newStar.setAttribute("src", `static/star-${status}.png`)
        return newStar
    }
}

// Update star count
function updateStarCount(side, action) {
    if (!isStarOn) return

    if (side === "red" && action === "plus") currentLeftStars++
    else if (side === "blue" && action === "plus") currentRightStars++
    else if (side === "red" && action === "minus") currentLeftStars--
    else if (side === "blue" && action === "minus") currentRightStars--

    if (currentLeftStars > currentFirstTo) currentLeftStars = currentFirstTo
    else if (currentLeftStars < 0) currentLeftStars = 0
    if (currentRightStars > currentFirstTo) currentRightStars = currentFirstTo
    else if (currentRightStars < 0) currentRightStars = 0

    createStarDisplay()
}

// Find beatmap
const findBeatmap = beatmapId => allBeatmaps.find(beatmap => beatmap.beatmap_id == beatmapId)

// Create pick tile
function createPickTile(height) {
    const mapPickTile = document.createElement("div")
    mapPickTile.classList.add("map-pick-tile")
    mapPickTile.style.height = `${height}px`

    const mapPickModId = document.createElement("div")
    mapPickModId.classList.add("map-pick-mod-id")

    const mapPickPickedWon = document.createElement("div")
    mapPickPickedWon.classList.add("map-pick-picked-won")

    mapPickTile.append(mapPickModId, mapPickPickedWon)
    return mapPickTile
}

// Create mappool management button
function createMappoolManagementButton(beatmap) {
    const mappoolManagementButton = document.createElement("button")
    mappoolManagementButton.classList.add("mappool-management-button")
    mappoolManagementButton.dataset.id = beatmap.beatmap_id
    mappoolManagementButton.addEventListener("mousedown", mapClickEvent)
    mappoolManagementButton.addEventListener("contextmenu", function(event) {event.preventDefault()})
    mappoolManagementButton.innerText = `${beatmap.mod}${beatmap.order}`
    return mappoolManagementButton
}

function getAverageRGB(imageElement, options = {}) {
    const {
        startX = 0,
        startY = 0,
        width = 100,
        height = 100
    } = options

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set canvas size to match the cropped region
    canvas.width = width
    canvas.height = height

    // Draw the specified region of the image
    ctx.drawImage(
        imageElement, 
        startX, startY, width, height,
        0, 0, width, height
    )

    // Get pixel data from the cropped region
    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data

    let r = 0, g = 0, b = 0
    const pixelCount = pixels.length / 4

    // Loop through pixels (RGBA format)
    for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
    }

    // Calculate and return average RGB values
    return {
        r: Math.floor(r / pixelCount),
        g: Math.floor(g / pixelCount),
        b: Math.floor(b / pixelCount)
    }
}

// Predefined region selector functions
function getTopLeftAvgRGB(imageElement, width = 100, height = 100) {
    return getAverageRGB(imageElement, { startX: 0, startY: 0, width, height })
}

function getBottomRightAvgRGB(imageElement, width = 100, height = 75) {
    return getAverageRGB(imageElement, {
        startX: imageElement.width - width,
        startY: imageElement.height - height,
        width,
        height
    })
}

function getRoundNameAvgRGB(imageElement, width = 100, height = 75) {
    return getAverageRGB(imageElement, {
        startX: imageElement.width - width,
        startY: imageElement.height - height,
        width,
        height
    })
}

// Protect elements
const redProtectMapEl = document.getElementById("red-protect-map")
const blueProtectMapEl = document.getElementById("blue-protect-map")

// Ban containers
const redBanMapContainerEl = document.getElementById("red-ban-map-container")
const blueBanMapContainerEl = document.getElementById("blue-ban-map-container")

// Pick containers
const redPickMapContainerEl = document.getElementById("mappool-main-section-left")
const bluePickMapContainerEl = document.getElementById("mappool-main-section-right")

function scheduleSceneTransition(targetSceneName, delay) {
    const createTransitionTask = (duration) => setTimeout(() => {
        obsGetCurrentScene((currentScene) => {
            if (currentScene.name === targetSceneName) {
                autoadvance_timer_label.textContent = `Already on ${targetSceneName}\n`;
                return;
            }
            obsSetCurrentScene(targetSceneName);
            autoadvance_timer_container.style.opacity = '0';
        });
    }, duration)

    // use global timeout for this overlay, the pick/ban style doesn't lend to repeated pick events so
    // no point in idempotence
    clearTimeout(sceneTransitionTimeoutID);
    sceneTransitionTimeoutID = createTransitionTask(delay);

    autoadvance_timer_time = new CountUp('autoAdvanceTimerTime',
        delay / 1000,
        0,
        1,
        delay / 1000,
        {useEasing: false, suffix: 's'}
    );
    autoadvance_timer_time.start();
    autoadvance_timer_container.style.opacity = '1';
    autoadvance_timer_label.textContent = `Switching to ${targetSceneName} in`;
}

// Map Click Event
function mapClickEvent(event) {
    // Find map
    const currentMapId = this.dataset.id
    const currentMap = findBeatmap(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"
    if (event.shiftKey) action = "protect"

    // Check if map exists in protects
    let protectCheck = false
    if (redProtectMapEl.dataset.id == currentMapId || blueProtectMapEl.dataset.id == currentMapId) protectCheck = true
    
    // Check if map exists in bans
    const banCheck = !!(
        redBanMapContainerEl.querySelector(`[data-id="${currentMapId}"]`) ||
        blueBanMapContainerEl.querySelector(`[data-id="${currentMapId}"]`)
    )

    // Check if map exists in picks
    const pickCheck = !!(
        redPickMapContainerEl.querySelector(`[data-id="${currentMapId}"]`) ||
        bluePickMapContainerEl.querySelector(`[data-id="${currentMapId}"]`)
    )

    // Protects first
    if (action === "protect") {
        if (banCheck) return
        // Find and set details
        const currentProtectElement = team === "red" ? redProtectMapEl : blueProtectMapEl
        currentProtectElement.style.display = "block"
        currentProtectElement.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
        currentProtectElement.children[1].innerText = `${currentMap.mod}${currentMap.order}`
        currentProtectElement.dataset.id = currentMapId

        switch (currentMap.mod) {
            case "NM": currentProtectElement.children[1].style.color = "rgb(158, 194, 227)"; break;
            case "HD": currentProtectElement.children[1].style.color = "#F1C232"; break;
            case "HR": currentProtectElement.children[1].style.color = "#E68080"; break;
            case "DT": currentProtectElement.children[1].style.color = "rgb(206, 193, 225)"; break;
            case "FM": currentProtectElement.children[1].style.color = "rgb(225, 189, 213)"; break;
            case "TB": currentProtectElement.children[1].style.color = "rgb(129, 179, 165)"; break;
        }
    }

    // Bans
    if (action === "ban") {
        if (banCheck || pickCheck || protectCheck) return
        // Find tile
        const currentBanContainer = team === "red" ? redBanMapContainerEl : blueBanMapContainerEl
        let currentBanElement
        for (let i = 0; i < currentBanContainer.childElementCount; i++) {
            if (currentBanContainer.children[i].dataset.id) continue
            currentBanElement = currentBanContainer.children[i]
            break
        }

        if (!currentBanElement) return

        // Set details
        currentBanElement.style.display = "block"
        currentBanElement.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
        currentBanElement.children[1].innerText = `${currentMap.mod}${currentMap.order}`
        currentBanElement.dataset.id = currentMapId

        switch (currentMap.mod) {
            case "NM": currentBanElement.children[1].style.color = "rgb(158, 194, 227)"; break;
            case "HD": currentBanElement.children[1].style.color = "#F1C232"; break;
            case "HR": currentBanElement.children[1].style.color = "#E68080"; break;
            case "DT": currentBanElement.children[1].style.color = "rgb(206, 193, 225)"; break;
            case "FM": currentBanElement.children[1].style.color = "rgb(225, 189, 213)"; break;
            case "TB": currentBanElement.children[1].style.color = "rgb(129, 179, 165)"; break;
        }
    }

    // Set picks
    if (action === "pick") {
        if (banCheck || pickCheck) return
        // Find tile
        const currentPickContainer = team === "red" ? redPickMapContainerEl : bluePickMapContainerEl
        let currentPickElement
        for (let i = 0; i < currentPickContainer.childElementCount; i++) {
            if (currentPickContainer.children[i].dataset.id) continue
            currentPickElement = currentPickContainer.children[i]
            break
        }

        if (!currentPickElement) return

        // Set details
        currentPickElement.style.display = "block"
        currentPickElement.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
        currentPickElement.children[0].innerText = `${currentMap.mod}${currentMap.order}`
        currentPickElement.children[1].innerText = `PICKED`
        currentPickElement.children[1].style.color = "gold"
        currentPickElement.dataset.id = currentMapId
        previousMappoolBeatmap = currentMappoolBeatmap
        currentMappoolBeatmap = currentPickElement

        switch (currentMap.mod) {
            case "NM": currentPickElement.children[0].style.color = "rgb(158, 194, 227)"; break;
            case "HD": currentPickElement.children[0].style.color = "#F1C232"; break;
            case "HR": currentPickElement.children[0].style.color = "#E68080"; break;
            case "DT": currentPickElement.children[0].style.color = "rgb(206, 193, 225)"; break;
            case "FM": currentPickElement.children[0].style.color = "rgb(225, 189, 213)"; break;
            case "TB": currentPickElement.children[0].style.color = "rgb(129, 179, 165)"; break;
        }

        document.cookie = `currentTeamPick=${team}; path=/`

        if (enableAutoAdvance) {
            scheduleSceneTransition(gameplay_scene_name, pick_to_transition_delay_ms);
        }
    }
}

let allTeams
async function initialise() {
    await getTeamStats()
    await getApi()
    allTeams = await getTeams()
    await getBeatmaps()
}
initialise()

// Find Team 
const findTeam = teamName => allTeams.find(team => team.country_name.toUpperCase() == teamName.toUpperCase())

// Team Flags
const redTeamFlagEl = document.getElementById("red-team-flag")
const blueTeamFlagEl = document.getElementById("blue-team-flag")
// Team Names
const redTeamNameEl = document.getElementById("red-team-name")
const blueTeamNameEl = document.getElementById("blue-team-name")
// Player Name Containers
const redPlayerNameContainerEl = document.getElementById("red-player-names")
const bluePlayerNameContainerEl = document.getElementById("blue-player-names")
// Variables
let leftTeamName, rightTeamName

// Chat Display
const chatDisplayEl = document.getElementById("chat-display")
let chatLen

// Team stats elements
// Red team number
const teamStatsNumberAimRedEl = document.getElementById("team-stats-number-aim-red")
const teamStatsNumberSpeedRedEl = document.getElementById("team-stats-number-speed-red")
const teamStatsNumberStaminaRedEl = document.getElementById("team-stats-number-stamina-red")
const teamStatsNumberFingerControlRedEl = document.getElementById("team-stats-number-finger-control-red")
const teamStatsNumberPrecisionRedEl = document.getElementById("team-stats-number-precision-red")
const teamStatsNumberReadingRedEl = document.getElementById("team-stats-number-reading-red")
const teamStatsNumberTechnicalRedEl = document.getElementById("team-stats-number-technical-red")
// Blue team number
const teamStatsNumberAimBlueEl = document.getElementById("team-stats-number-aim-blue")
const teamStatsNumberSpeedBlueEl = document.getElementById("team-stats-number-speed-blue")
const teamStatsNumberStaminaBlueEl = document.getElementById("team-stats-number-stamina-blue")
const teamStatsNumberFingerControlBlueEl = document.getElementById("team-stats-number-finger-control-blue")
const teamStatsNumberPrecisionBlueEl = document.getElementById("team-stats-number-precision-blue")
const teamStatsNumberReadingBlueEl = document.getElementById("team-stats-number-reading-blue")
const teamStatsNumberTechnicalBlueEl = document.getElementById("team-stats-number-technical-blue")
// Red team bar
const teamStatsBarRedAimEl = document.getElementById("team-stats-bar-red-aim")
const teamStatsBarRedSpeedEl = document.getElementById("team-stats-bar-red-speed")
const teamStatsBarRedStaminaEl = document.getElementById("team-stats-bar-red-stamina")
const teamStatsBarRedFingerControlEl = document.getElementById("team-stats-bar-red-finger-control")
const teamStatsBarRedPrecisionEl = document.getElementById("team-stats-bar-red-precision")
const teamStatsBarRedReadingEl = document.getElementById("team-stats-bar-red-reading")
const teamStatsBarRedTechnicalEl = document.getElementById("team-stats-bar-red-technical")
// Blue team bar
const teamStatsBarBlueAimEl = document.getElementById("team-stats-bar-blue-aim")
const teamStatsBarBlueSpeedEl = document.getElementById("team-stats-bar-blue-speed")
const teamStatsBarBlueStaminaEl = document.getElementById("team-stats-bar-blue-stamina")
const teamStatsBarBlueFingerControlEl = document.getElementById("team-stats-bar-blue-finger-control")
const teamStatsBarBluePrecisionEl = document.getElementById("team-stats-bar-blue-precision")
const teamStatsBarBlueReadingEl = document.getElementById("team-stats-bar-blue-reading")
const teamStatsBarBlueTechnicalEl = document.getElementById("team-stats-bar-blue-technical")

// IPC State
let currentIPCState, previousIPCState

// Score Visibility
let scoreVisible, checkedWinner

let currentLeftTeamScore, currentRightTeamScore

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // console.log(data)

    // Set teams
    if (leftTeamName !== data.tourney.team.left && allTeams) {
        leftTeamName = data.tourney.team.left
        if (leftTeamName.toLowerCase() === "russia") leftTeamName = "russian federation"
        if (leftTeamName.toLowerCase() === "uae") leftTeamName = "united arab emirates"
        if (leftTeamName.toLowerCase() === "russian federation") redTeamNameEl.innerText = "RUSSIA"
        else if (leftTeamName.toLowerCase() === "united arab emirates") redTeamNameEl.innerText = "UAE"
        else redTeamNameEl.innerText = leftTeamName.toUpperCase()

        // Find team
        const team = findTeam(leftTeamName.toLowerCase())
        if (team) {
            redTeamFlagEl.setAttribute("src", `https://osuflags.omkserver.nl/${team.flag_code}-50.png`)
            redPlayerNameContainerEl.innerHTML = ""
            for (let i = 0; i < team.current_year.length; i++) {
                if (team.current_year[i].trim() !== "") redPlayerNameContainerEl.append(createPlayerName("red", team.current_year[i]))
            }
        }

        // Find team stats
        const teamStats = findTeamStatsTeam(leftTeamName.toLowerCase())
        if (teamStats) {
            teamStatsNumberAimRedEl.innerText = teamStats.aim
            teamStatsNumberSpeedRedEl.innerText = teamStats.speed
            teamStatsNumberStaminaRedEl.innerText = teamStats.stamina
            teamStatsNumberFingerControlRedEl.innerText = teamStats.finger_control
            teamStatsNumberPrecisionRedEl.innerText = teamStats.precision
            teamStatsNumberReadingRedEl.innerText = teamStats.reading
            teamStatsNumberTechnicalRedEl.innerText = teamStats.technical

            teamStatsBarRedAimEl.style.width = `${teamStats.aim / 10 * 190}px`
            teamStatsBarRedSpeedEl.style.width = `${teamStats.speed / 10 * 190}px`
            teamStatsBarRedStaminaEl.style.width = `${teamStats.stamina / 10 * 190}px`
            teamStatsBarRedFingerControlEl.style.width = `${teamStats.finger_control / 10 * 190}px`
            teamStatsBarRedPrecisionEl.style.width = `${teamStats.precision / 10 * 190}px`
            teamStatsBarRedReadingEl.style.width = `${teamStats.reading / 10 * 190}px`
            teamStatsBarRedTechnicalEl.style.width = `${teamStats.technical / 10 * 190}px`
        }
    }
    if (rightTeamName !== data.tourney.team.right && allTeams) {
        rightTeamName = data.tourney.team.right
        if (rightTeamName.toLowerCase() === "russia") rightTeamName = "russian federation"
        if (rightTeamName.toLowerCase() === "uae") rightTeamName = "united arab emirates"
        if (rightTeamName.toLowerCase() === "russian federation") blueTeamNameEl.innerText = "RUSSIA"
        else if (rightTeamName.toLowerCase() === "united arab emirates") blueTeamNameEl.innerText = "UAE"
        else blueTeamNameEl.innerText = rightTeamName.toUpperCase()

        // Find team
        const team = findTeam(rightTeamName.toLowerCase())
        if (team) {
            blueTeamFlagEl.setAttribute("src", `https://osuflags.omkserver.nl/${team.flag_code}-50.png`)
            bluePlayerNameContainerEl.innerHTML = ""
            for (let i = 0; i < team.current_year.length; i++) {
                if (team.current_year[i].trim() !== "") bluePlayerNameContainerEl.append(createPlayerName("blue", team.current_year[i]))
            }
        }

        // Find team stats
        const teamStats = findTeamStatsTeam(rightTeamName.toLowerCase())
        if (teamStats) {
            teamStatsNumberAimBlueEl.innerText = teamStats.aim
            teamStatsNumberSpeedBlueEl.innerText = teamStats.speed
            teamStatsNumberStaminaBlueEl.innerText = teamStats.stamina
            teamStatsNumberFingerControlBlueEl.innerText = teamStats.finger_control
            teamStatsNumberPrecisionBlueEl.innerText = teamStats.precision
            teamStatsNumberReadingBlueEl.innerText = teamStats.reading
            teamStatsNumberTechnicalBlueEl.innerText = teamStats.technical

            teamStatsBarBlueAimEl.style.width = `${teamStats.aim / 10 * 190}px`
            teamStatsBarBlueSpeedEl.style.width = `${teamStats.speed / 10 * 190}px`
            teamStatsBarBlueStaminaEl.style.width = `${teamStats.stamina / 10 * 190}px`
            teamStatsBarBlueFingerControlEl.style.width = `${teamStats.finger_control / 10 * 190}px`
            teamStatsBarBluePrecisionEl.style.width = `${teamStats.precision / 10 * 190}px`
            teamStatsBarBlueReadingEl.style.width = `${teamStats.reading / 10 * 190}px`
            teamStatsBarBlueTechnicalEl.style.width = `${teamStats.technical / 10 * 190}px`
        }
    }

    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.chat.length) ? (chatDisplayEl.innerHTML = "", chatLen = 0) : null
        const fragment = document.createDocumentFragment()

        for (let i = chatLen; i < data.tourney.chat.length; i++) {
            const chatColour = data.tourney.chat[i].team

            // Chat message container
            const chatMessageContainer = document.createElement("div")
            chatMessageContainer.classList.add("message-container")

            // Time
            const chatDisplayTime = document.createElement("div")
            chatDisplayTime.classList.add("message-time")
            chatDisplayTime.innerText = data.tourney.chat[i].timestamp

            // Message Wrapper
            const messageWrapper = document.createElement("div")
            messageWrapper.classList.add("message-wrapper")

            // Name
            const chatDisplayName = document.createElement("div")
            chatDisplayName.classList.add("message-name")
            chatDisplayName.classList.add(chatColour)
            chatDisplayName.innerText = data.tourney.chat[i].name + ": ";

            // Message
            const chatDisplayMessage = document.createElement("div")
            chatDisplayMessage.classList.add("message-content")
            chatDisplayMessage.innerText = data.tourney.chat[i].message

            messageWrapper.append(chatDisplayName, chatDisplayMessage)
            chatMessageContainer.append(chatDisplayTime, messageWrapper)
            fragment.append(chatMessageContainer)
        }

        chatDisplayEl.append(fragment)
        chatLen = data.tourney.chat.length
        chatDisplayEl.scrollTop = chatDisplayEl.scrollHeight
    }

    // Set beatmap information
    if (mapId !== data.beatmap.id && mapChecksum !== data.beatmap.checksum) {
        mapId = data.beatmap.id
        mapChecksum = data.beatmap.checksum

        // Find element
        const element = mappoolManagementSystemButtonContainer.querySelector(`[data-id="${mapId}"]`)

        // Click Event
        if (isAutopick && (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true")) {
            // Check if autopicked already
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: (currentNextAutopick === "left")? 0 : 2
            })
            element.dispatchEvent(event)
            element.setAttribute("data-is-autopicked", "true")

            if (currentNextAutopick === "left") setNextPick("right")
            else if (currentNextAutopick === "right") setNextPick("left")
        }
    }

    if (scoreVisible !== data.tourney.scoreVisible) scoreVisible = data.tourney.scoreVisible

    // Set scores
    if (scoreVisible) {
        currentLeftTeamScore = 0
        currentRightTeamScore = 0
        currentScoreDelta = 0
        
        for (let i = 0; i < data.tourney.clients.length; i++) {
            const currentPlayer = data.tourney.clients[i]
            let currentScore = currentPlayer.play.score
            
            // Check for EZ, EZHD, and multiplier
            if (currentMappoolBeatmap && currentMappoolBeatmap.mod === "FM") {
                const mods = getMods(currentPlayer.play.mods.number)
                if (mods.includes("EZ") && mods.includes("HD")) currentScore *= currentMappoolBeatmap.EZHDMulti
                else if (mods.includes("EZ")) currentScore *= currentMappoolBeatmap.EZMulti
            }

            // Add score to correct team
            if (currentPlayer.team === "left") currentLeftTeamScore += currentScore
            else if (currentPlayer.team === "right") currentRightTeamScore += currentScore
        }
    }

    // Set IPC State
    if (currentIPCState !== data.tourney.ipcState) {
        currentIPCState = data.tourney.ipcState
        if (currentIPCState === 4 && !checkedWinner) {
            checkedWinner = true
            
            if (currentLeftTeamScore > currentRightTeamScore) {
                updateStarCount('red', 'plus')
                document.cookie = `currentWinner=red; path=/`
            } else if (currentLeftTeamScore < currentRightTeamScore) {
                updateStarCount('blue', 'plus')
                document.cookie = `currentWinner=blue; path=/`
            }
        }

        if (currentIPCState !== 4) checkedWinner = false

        // IPC State is generally 1
        if (previousIPCState === 4 && 
            currentIPCState !== previousIPCState && 
            enableAutoAdvance && 
            currentLeftStars !== currentFirstTo && 
            currentRightStars !== currentFirstTo) {
            obsGetCurrentScene((scene) => {
                if (scene.name === mappool_scene_name) return
                obsSetCurrentScene(mappool_scene_name)
            })
        } else if (previousIPCState === 4 &&
            currentIPCState !== previousIPCState &&
            enableAutoAdvance
        ) {
            obsGetCurrentScene((scene) => {
                if (scene.name === winner_scene_name) return
                obsSetCurrentScene(winner_scene_name)
            })
        }
        previousIPCState = currentIPCState
    }
}

// Make player name
function createPlayerName(side, playerName) {
    const playerNameContainer = document.createElement("div")
    playerNameContainer.classList.add("player-name-container", `${side}-player-name-container`)

    const playerDotPoint = document.createElement("div")
    playerDotPoint.classList.add("player-dot-ellipsis")

    const playerNameDiv = document.createElement("div")
    playerNameDiv.classList.add("player-name")
    playerNameDiv.innerText = playerName.toUpperCase()

    playerNameContainer.append(playerDotPoint, playerNameDiv)
    return playerNameContainer
}

// Toggle set next pick
const nextAutopickEl = document.getElementById("next-autopick")
let currentNextAutopick
function setNextPick(colour) {
    currentNextAutopick = colour
    nextAutopickEl.innerText = (currentNextAutopick === "left") ? "Red" : "Blue"
}

// Toggle Next Pick
const toggleNextPickEl = document.getElementById("toggle-next-pick")
let isAutopick = false
function toggleAutoPick() {
    isAutopick = !isAutopick
    if (isAutopick) toggleNextPickEl.innerText = "Toggle Autopick: ON"
    else toggleNextPickEl.innerText = "Toggle Autopick: OFF"
}

// Pick Ban Management Select Action
const pickBanProtectManagementEl = document.getElementById("pick-ban-protect-management")
const pickBanManagementSelectActionEl = document.getElementById("pick-ban-protect-management-select-action")
let currentAction
function setPickBanProtectAction() {
    currentAction = pickBanManagementSelectActionEl.value

    while (pickBanProtectManagementEl.childElementCount > 3) {
        pickBanProtectManagementEl.lastElementChild.remove()
    }

    sidebarButtonBeatmap = undefined
    currentBanContainer = undefined

    if (currentAction === "setProtect" || currentAction === "removeProtect") {
        // Which team?
        makeSidebarText("Which Team?")

        // Which Team Select
        const whichTeamSelect = document.createElement("select")
        whichTeamSelect.setAttribute("id", "which-team-select")
        whichTeamSelect.classList.add("pick-ban-protect-management-select")
        whichTeamSelect.setAttribute("size", 2)

        // Which Team Select Options
        whichTeamSelect.append(makeTeamSelectOption("red"), makeTeamSelectOption("blue"))
        pickBanProtectManagementEl.append(whichTeamSelect)

        if (currentAction === "setProtect") makeTeamAddMaps()
    } else if (currentAction === "setBan" || currentAction === "removeBan") {
        // Which team?
        makeSidebarText("Which Team?")

        // Which Team Select
        const whichTeamSelect = document.createElement("select")
        whichTeamSelect.setAttribute("id", "which-ban-select")
        whichTeamSelect.classList.add("pick-ban-protect-management-select")
        whichTeamSelect.setAttribute("size", 4)
        whichTeamSelect.setAttribute("onchange", "setBanContainer(this)")

        // Which Team Select Options
        whichTeamSelect.append(makeTeamBanOption("red", 1), makeTeamBanOption("blue", 1), makeTeamBanOption("red", 2), makeTeamBanOption("blue", 2))
        if (currentBestOf !== 9) {
            whichTeamSelect.append(makeTeamBanOption("red", 3), makeTeamBanOption("blue", 3))
            whichTeamSelect.setAttribute("size", 6)
        }
        pickBanProtectManagementEl.append(whichTeamSelect)

        if (currentAction === "setBan") makeTeamAddMaps()
    } else if (currentAction === "setPick" || currentAction === "removePick") {
        // Which pick?
        makeSidebarText("Which Pick?")

        // Which pick?
        const whichPickSelect = document.createElement("div")
        whichPickSelect.classList.add("which-map-select")

        // Which Map Select
        for (let i = 1; i < currentFirstTo; i++) {
            // Which Map Button
            const whichPickButton = document.createElement("button")
            whichPickButton.classList.add("which-side-button", "which-pick-button")
            whichPickButton.innerText = `Red Pick ${i}`
            whichPickButton.setAttribute("onclick", "setSidebarPick(this)")
            whichPickButton.dataset.side = "red"
            whichPickButton.dataset.pickNumber = i
            whichPickSelect.append(whichPickButton)
        }
        for (let i = 1; i < currentFirstTo; i++) {
            // Which Map Button
            const whichPickButton = document.createElement("button")
            whichPickButton.classList.add("which-side-button", "which-pick-button")
            whichPickButton.innerText = `Blue Pick ${i}`
            whichPickButton.setAttribute("onclick", "setSidebarPick(this)")
            whichPickButton.dataset.side = "blue"
            whichPickButton.dataset.pickNumber = i
            whichPickSelect.append(whichPickButton)
        }
        pickBanProtectManagementEl.append(whichPickSelect)

        if (currentAction === "setPick") makeTeamAddMaps()
    } else if (currentAction === "setWinner" || currentAction === "removeWinner") {
        // Which pick?
        makeSidebarText("Which Pick?")

        // Which pick?
        const whichPickSelect = document.createElement("div")
        whichPickSelect.classList.add("which-map-select")

        // Which Map Select
        for (let i = 1; i < currentFirstTo; i++) {
            if (redPickMapContainerEl.children[i - 1].dataset.id) {
                // Which Map Button
                const whichPickButton = document.createElement("button")
                whichPickButton.classList.add("which-side-button", "which-pick-button")
                whichPickButton.innerText = `Red Pick ${i}`
                whichPickButton.setAttribute("onclick", "setSidebarPick(this)")
                whichPickButton.dataset.side = "red"
                whichPickButton.dataset.pickNumber = i
                whichPickSelect.append(whichPickButton)
            }
        }
        for (let i = 1; i < currentFirstTo; i++) {
            if (bluePickMapContainerEl.children[i - 1].dataset.id) {
                // Which Map Button
                const whichPickButton = document.createElement("button")
                whichPickButton.classList.add("which-side-button", "which-pick-button")
                whichPickButton.innerText = `Blue Pick ${i}`
                whichPickButton.setAttribute("onclick", "setSidebarPick(this)")
                whichPickButton.dataset.side = "blue"
                whichPickButton.dataset.pickNumber = i
                whichPickSelect.append(whichPickButton)
            }
        }
        pickBanProtectManagementEl.append(whichPickSelect)

        if (currentAction === "setWinner") {
            // Which team?
            makeSidebarText("Which Team?")

            // Which Team Select
            const whichTeamSelect = document.createElement("select")
            whichTeamSelect.setAttribute("id", "which-team-select")
            whichTeamSelect.classList.add("pick-ban-protect-management-select")
            whichTeamSelect.setAttribute("size", 2)

            // Which Team Select Options
            whichTeamSelect.append(makeTeamSelectOption("red"), makeTeamSelectOption("blue"))
            pickBanProtectManagementEl.append(whichTeamSelect)
        }
    }

    // Apply changes button
    const applyChangesButton = document.createElement("button")
    applyChangesButton.classList.add("apply-changes-button")
    applyChangesButton.innerText = "Apply Changes"

    // Apply changes clicks
    switch (currentAction) {
        case "setProtect": applyChangesButton.setAttribute("onclick", "sidebarSetProtectAction()"); break;
        case "removeProtect": applyChangesButton.setAttribute("onclick", "sidebarRemoveProtectAction()"); break;
        case "setBan": applyChangesButton.setAttribute("onclick", "sidebarSetBanAction()"); break;
        case "removeBan": applyChangesButton.setAttribute("onclick", "sidebarRemoveBanAction()"); break;
        case "setPick": applyChangesButton.setAttribute("onclick", "sidebarSetPickAction()"); break;
        case "removePick": applyChangesButton.setAttribute("onclick", "sidebarRemovePickAction()"); break;
        case "setWinner": applyChangesButton.setAttribute("onclick", "sidebarSetWinnerAction()"); break;
        case "removeWinner": applyChangesButton.setAttribute("onclick", "sidebarRemoveWinnerAction()"); break;
    }
    pickBanProtectManagementEl.append(applyChangesButton)
}

// Make header
function makeSidebarText(string) {
    const element = document.createElement("div")
    element.classList.add("sidebar-text")
    element.innerText = string
    pickBanProtectManagementEl.append(element)
}

// Team Select Options
function makeTeamSelectOption(team) {
    const selectOptionTeam = document.createElement("option")
    selectOptionTeam.setAttribute("value", team)
    selectOptionTeam.innerText = `${team.substring(0, 1).toUpperCase()}${team.substring(1)}`
    return selectOptionTeam
}

// Team Ban Options
function makeTeamBanOption(team, number) {
    const selectOptionBan = document.createElement("option")
    selectOptionBan.setAttribute("value", `${team}|${number}`)
    selectOptionBan.innerText = `${team.substring(0, 1).toUpperCase()}${team.substring(1)} Ban ${number}`
    return selectOptionBan
}

// Team Add maps
function makeTeamAddMaps() {
    // Which map?
    makeSidebarText("Which Map?")

    // Which Map Select
    const whichMapSelect = document.createElement("div")
    whichMapSelect.classList.add("which-map-select")
    for (let i = 0; i < allBeatmaps.length; i++) {
        // Which Map Button
        const whichMapButton = document.createElement("button")
        whichMapButton.classList.add("which-side-button", "which-map-button")
        whichMapButton.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        whichMapButton.setAttribute("onclick", "setSidebarBeatmap(this)")
        whichMapButton.dataset.id = allBeatmaps[i].beatmap_id
        whichMapSelect.append(whichMapButton)
    }
    pickBanProtectManagementEl.append(whichMapSelect)
}

// Set sidebar beatmap
const whichMapButtons = document.getElementsByClassName("which-map-button")
let sidebarButtonBeatmap
function setSidebarBeatmap(element) {
    sidebarButtonBeatmap = element.dataset.id
    for (let i = 0; i < whichMapButtons.length; i++) {
        whichMapButtons[i].style.backgroundColor = "transparent"
        whichMapButtons[i].style.color = "var(--secondary-colour)"
    }
    element.style.backgroundColor = "#CECECE"
    element.style.color = "black"
}

// Set sidebar pick
const whichPickButtons = document.getElementsByClassName("which-pick-button")
let sidebarButtonPickSide, sidebarButtonPickNumber
function setSidebarPick(element) {
    sidebarButtonPickSide = element.dataset.side
    sidebarButtonPickNumber = element.dataset.pickNumber

    for (let i = 0; i < whichPickButtons.length; i++) {
        whichPickButtons[i].style.backgroundColor = "transparent"
        whichPickButtons[i].style.color = "var(--secondary-colour)"
    }

    element.style.backgroundColor = "#CECECE"
    element.style.color = "black"
}

// Sidebar Set Protect Action
function sidebarSetProtectAction() {
    const whichTeamSelectEl = document.getElementById("which-team-select")

    // Get current protect element
    let currentProtect
    if (whichTeamSelectEl.value === "red") currentProtect = redProtectMapEl
    else if (whichTeamSelectEl.value === "blue") currentProtect = blueProtectMapEl
    if (!currentProtect) return

    // Get map
    if (!sidebarButtonBeatmap) return
    const currentMap = findBeatmap(sidebarButtonBeatmap)

    // Set details
    currentProtect.dataset.id = sidebarButtonBeatmap
    currentProtect.style.display = "block"
    currentProtect.children[0].style.background = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    currentProtect.children[1].innerText = `${currentMap.mod}${currentMap.order}`

    switch (currentMap.mod) {
        case "NM": currentProtect.children[1].style.color = "rgb(158, 194, 227)"; break;
        case "HD": currentProtect.children[1].style.color = "#F1C232"; break;
        case "HR": currentProtect.children[1].style.color = "#E68080"; break;
        case "DT": currentProtect.children[1].style.color = "rgb(206, 193, 225)"; break;
        case "FM": currentProtect.children[1].style.color = "rgb(225, 189, 213)"; break;
        case "TB": currentProtect.children[1].style.color = "rgb(129, 179, 165)"; break;
    }
}

// Sidebar Remove Protect Action
function sidebarRemoveProtectAction() {
    const whichTeamSelectEl = document.getElementById("which-team-select")

    // Get current protect element
    let currentProtect
    if (whichTeamSelectEl.value === "red") currentProtect = redProtectMapEl
    else if (whichTeamSelectEl.value === "blue") currentProtect = blueProtectMapEl
    if (!currentProtect) return

    // remove details
    currentProtect.style.display = "none"
    currentProtect.removeAttribute("data-id")
}

// Sidebar Set Ban Action
function sidebarSetBanAction() {
    if (!currentBanContainer) return

    // Get map
    if (!sidebarButtonBeatmap) return
    const currentMap = findBeatmap(sidebarButtonBeatmap)

    currentBanContainer.dataset.id = sidebarButtonBeatmap
    currentBanContainer.style.display = "block"
    currentBanContainer.children[0].style.background = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    currentBanContainer.children[1].innerText = `${currentMap.mod}${currentMap.order}`

    switch (currentMap.mod) {
        case "NM": currentBanContainer.children[1].style.color = "rgb(158, 194, 227)"; break;
        case "HD": currentBanContainer.children[1].style.color = "#F1C232"; break;
        case "HR": currentBanContainer.children[1].style.color = "#E68080"; break;
        case "DT": currentBanContainer.children[1].style.color = "rgb(206, 193, 225)"; break;
        case "FM": currentBanContainer.children[1].style.color = "rgb(225, 189, 213)"; break;
        case "TB": currentBanContainer.children[1].style.color = "rgb(129, 179, 165)"; break;
    }
}

// Sidebar Remove Ban ACtion
function sidebarRemoveBanAction() {
    if (!currentBanContainer) return
    currentBanContainer.removeAttribute("data-id")
    currentBanContainer.style.display = "none"
}

// Sidebar Set Pick Action
function sidebarSetPickAction() {
    if (!sidebarButtonPickSide || !sidebarButtonPickNumber || !sidebarButtonBeatmap) return

    const container = (sidebarButtonPickSide === "red")? redPickMapContainerEl : bluePickMapContainerEl
    const tile = container.children[Number(sidebarButtonPickNumber) - 1]
    if (!tile) return

    const currentMap = findBeatmap(sidebarButtonBeatmap)

    tile.dataset.id = sidebarButtonBeatmap
    tile.style.display = "block"
    tile.style.height = `${mapPickTileHeight}px`
    tile.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    tile.children[0].innerText = `${currentMap.mod}${currentMap.order}`
    if (tile.children[1].innerText.trim() === "") {
        tile.children[1].innerText = "PICKED"
        tile.children[1].color = "gold"
    }

    switch (currentMap.mod) {
        case "NM": tile.children[0].style.color = "rgb(158, 194, 227)"; break;
        case "HD": tile.children[0].style.color = "#F1C232"; break;
        case "HR": tile.children[0].style.color = "#E68080"; break;
        case "DT": tile.children[0].style.color = "rgb(206, 193, 225)"; break;
        case "FM": tile.children[0].style.color = "rgb(225, 189, 213)"; break;
        case "TB": tile.children[0].style.color = "rgb(129, 179, 165)"; break;
    }
}

// Sidebar Remove Pick Action
function sidebarRemovePickAction() {
    if (!sidebarButtonPickSide || !sidebarButtonPickNumber) return

    const container = (sidebarButtonPickSide === "red")? redPickMapContainerEl : bluePickMapContainerEl
    const tile = container.children[Number(sidebarButtonPickNumber) - 1]
    if (!tile) return

    tile.removeAttribute("data-id")
    tile.style.display = "none"
}

// Sidebar Set Winner Action
function sidebarSetWinnerAction() {
    if (!sidebarButtonPickSide || !sidebarButtonPickNumber) return

    const whichTeamSelectEl = document.getElementById("which-team-select")

    // Get current protect element
    let currentWinner
    if (whichTeamSelectEl.value === "red") currentWinner = "RED"
    else if (whichTeamSelectEl.value === "blue") currentWinner = "BLUE"
    if (!currentWinner) return

    const container = (sidebarButtonPickSide === "red")? redPickMapContainerEl : bluePickMapContainerEl
    const tile = container.children[Number(sidebarButtonPickNumber) - 1]
    if (!tile) return

    tile.children[1].innerText = `${currentWinner} WIN`
    if (currentWinner === "RED") tile.children[1].style.color = "#E68080"
    else tile.children[1].style.color = "rgb(158, 194, 227)"
}

// Sidebar Remove Winner Action
function sidebarRemoveWinnerAction() {
    if (!sidebarButtonPickSide || !sidebarButtonPickNumber) return

    const container = (sidebarButtonPickSide === "red")? redPickMapContainerEl : bluePickMapContainerEl
    const tile = container.children[Number(sidebarButtonPickNumber) - 1]
    if (!tile) return

    tile.children[1].innerText = "PICKED"
    tile.children[1].style.color = "gold"
}

setInterval(() => {
    // Get stars
    currentLeftStars = Number(getCookie("currentLeftStars"))
    currentRightStars = Number(getCookie("currentRightStars"))

    // Get winner of map
    const winnerOfMap = getCookie("currentWinner")
    if (currentMappoolBeatmap && winnerOfMap !== "none" && winnerOfMap) {
        currentMappoolBeatmap.children[1].innerText = `${winnerOfMap.toUpperCase()} WIN`
        if (winnerOfMap === "red") currentMappoolBeatmap.children[1].style.color = "#E68080"
        else currentMappoolBeatmap.children[1].style.color = "rgb(158, 194, 227)"
        document.cookie = "currentWinner=none; path=/"
    }

    // Set tiebreaker
    if (currentLeftStars + currentRightStars >= currentBestOf - 1 &&
        currentLeftStars >= currentFirstTo - 1 &&
        currentRightStars >= currentFirstTo - 1
    ) {
        previousMappoolBeatmap = currentMappoolBeatmap
        currentMappoolBeatmap = tiebreakerTile
        tiebreakerTile.style.opacity = 1
    } else if (window.getComputedStyle(tiebreakerTile).display === 1) {
        currentMappoolBeatmap = previousMappoolBeatmap
        tiebreakerTile.style.opacity = 0
    } else {
        tiebreakerTile.style.opacity = 0
    }
}, 200)


// OBS Information
const sceneCollection = document.getElementById("sceneCollection")
let autoadvance_button = document.getElementById('auto-advance-button')
let autoadvance_timer_container = document.getElementById('autoAdvanceTimer')
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel')
const pick_to_transition_delay_ms = 10000;
let enableAutoAdvance = false
const gameplay_scene_name = "Gameplay"
const mappool_scene_name = "Mappool"
const winner_scene_name = "Winner"

let sceneTransitionTimeoutID;

autoadvance_timer_container.style.opacity = '0';


function switchAutoAdvance() {
    enableAutoAdvance = !enableAutoAdvance
    if (enableAutoAdvance) {
        autoadvance_button.innerText = 'AUTO ADVANCE: ON'
        autoadvance_button.style.backgroundColor = 'var(--green)'
    } else {
        autoadvance_button.innerText = 'AUTO ADVANCE: OFF'
        autoadvance_button.style.backgroundColor = 'transparent'
    }
}

const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {})
const obsGetScenes = window.obsstudio?.getScenes ?? (() => {})
const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {})

obsGetScenes(scenes => {
    for (const scene of scenes) {
        let clone = document.getElementById("sceneButtonTemplate").content.cloneNode(true)
        let buttonNode = clone.querySelector('div')
        buttonNode.id = `scene__${scene}`
        buttonNode.textContent = `GO TO: ${scene}`
        buttonNode.onclick = function() { obsSetCurrentScene(scene); }
        sceneCollection.appendChild(clone)
    }

    obsGetCurrentScene((scene) => { document.getElementById(`scene__${scene.name}`).classList.add("active-scene") })
})

window.addEventListener('obsSceneChanged', function(event) {
    let activeButton = document.getElementById(`scene__${event.detail.name}`)
    for (const scene of sceneCollection.children) { scene.classList.remove("active-scene") }
    activeButton.classList.add("active-scene")
})

// Toggle stars
let isStarOn = true
function toggleStars() {
    isStarOn = !isStarOn
    if (isStarOn) {
        leftTeamStarContainerEl.style.display = "flex"
        rightTeamStarContainerEl.style.display = "flex"
    } else {
        leftTeamStarContainerEl.style.display = "none"
        rightTeamStarContainerEl.style.display = "none"
    }
    document.cookie = `toggleStars=${isStarOn}; path=/`
}
document.cookie = `toggleStars=${isStarOn}; path=/`
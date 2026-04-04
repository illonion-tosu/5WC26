// Extract Country Data
let allCountries
async function getCountries() {
    const response = await axios.get("../_data/predictions.json")
    allCountries = response.data
}
getCountries()
const findCountryByName = (name) => allCountries.find((c) => c.country_name.toLowerCase() === name.toLowerCase())

// Star Container
const redTeamStarContainerEl = document.getElementById("red-country-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-country-star-container")

// Tiebreaker Details
const tiebreakerCellEl = document.getElementById("tiebreaker-cell")
const tiebreakerArtistEl = document.getElementById("tiebreaker-artist")
const tiebreakerTitleEl = document.getElementById("tiebreaker-title")
const tiebreakerDifficultyEl = document.getElementById("tiebreaker-difficulty")
const tiebreakerMapperEl = document.getElementById("tiebreaker-mapper")
const tiebreakerCsEl = document.getElementById("tiebreaker-cs")
const tiebreakerArEl = document.getElementById("tiebreaker-ar")
const tiebreakerOdEl = document.getElementById("tiebreaker-od")
const tiebreakerBpmEl = document.getElementById("tiebreaker-bpm")
const tiebreakerLenEl = document.getElementById("tiebreaker-len")
const tiebreakerSrEl = document.getElementById("tiebreaker-sr")
let preloadedWithBg = false

// Find Beatmaps
const findBeatmap = beatmapId => allBeatmaps.find(beatmap => beatmap.beatmap_id == beatmapId)
// Extract Beatmap Data
let allBeatmaps
async function getBetmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps

    // Set star
    let bestOf = 0
    switch (response.data.roundName) {
        case "GROUP STAGE":
            bestOf = 9
            break
        case "ROUND OF 16": case "QUARTERFINALS": case "SEMIFINALS":
            bestOf = 11
            break
        default:
            bestOf = 13
    }

    // Render maps
    renderMaps()

    // Set default star count
    setDefaultStarCount(bestOf, redTeamStarContainerEl, blueTeamStarContainerEl)

    // Set tiebreaker information
    const tbMap = allBeatmaps[allBeatmaps.length - 1]
    const tbImagePath = `http://127.0.0.1:24050/Songs/${tbMap.beatmapset_id} ${tbMap.artist} - ${tbMap.title}`
    const filePathFound = await urlAccessible(`${tbImagePath}`)
    console.log(filePathFound)
    if (filePathFound.error || filePathFound.status < 200 || filePathFound.status > 299 || filePathFound.ok == false) {
        tiebreakerCellEl.style.backgroundImage = `url(https://assets.ppy.sh/beatmaps/${tbMap.beatmapset_id}/covers/cover.jpg)`
    } else {
        const image = await findImageFromDirListing(tbImagePath)
        tiebreakerCellEl.style.backgroundImage = `url("${image}")`
        preloadedWithBg = true
    }
    tiebreakerArtistEl.textContent = tbMap.artist
    tiebreakerTitleEl.textContent = tbMap.title
    tiebreakerDifficultyEl.textContent = `[${tbMap.version}]`
    tiebreakerMapperEl.textContent = tbMap.creator
    tiebreakerCsEl.textContent = Math.round(Number(tbMap.diff_size) * 10) / 10
    tiebreakerArEl.textContent = Math.round(Number(tbMap.diff_approach) * 10) / 10
    tiebreakerOdEl.textContent = Math.round(Number(tbMap.diff_overall) * 10) / 10
    tiebreakerBpmEl.textContent = Number(tbMap.bpm)
    tiebreakerLenEl.textContent = `${Math.floor(tbMap.total_length / 60)}:${String(Math.floor(tbMap.total_length % 60)).padStart(2,'0')}`
    tiebreakerSrEl.textContent = Math.round(Number(tbMap.difficultyrating) * 100) / 100
}
getBetmaps()

// fetchPing.js
async function urlAccessible(url, timeoutMs = 3000) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        res = await fetch(url, { method: 'GET', signal: controller.signal })
        clearTimeout(timeout);
        return { ok: res.ok, status: res.status, statusText: res.statusText }
    } catch (err) {
        clearTimeout(timeout);
        // If CORS blocked the response, fetch throws a TypeError and we can't tell more.
        // Distinguish abort vs network/CORS if needed:
        if (err.name === 'AbortError') return { ok: false, error: 'timeout' }
        return { ok: false, error: 'network_or_cors' }
    }
}

async function findImageFromDirListing(url) {
    try {
        const res = await fetch(url, { method: 'GET' })
        if (!res.ok) return null
        const html = await res.text()
        // Basic href extraction; adjust if server formats differently
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const anchors = Array.from(doc.querySelectorAll('a'))
        const image = anchors
            .map(a => a.getAttribute('href'))
            .filter(Boolean)
            .find(href => /\.(jpe?g|png|gif|webp|avif)$/i.test(href))
        if (!image) return null
        // Resolve relative URL
        return new URL(image, url).href
    } catch (err) {
        return null
    }
}

// NM Mod containers
const nmSectionPart1El = document.getElementById("nm-section-part-1")
const nmSectionPart2El = document.getElementById("nm-section-part-2")
const nmSection5MapsEl = document.getElementById("nm-section-5-maps")
// HD Mod containers / HR Mod Containers
const hdSectionEl = document.getElementById("hd-section")
const hrSectionEl = document.getElementById("hr-section")
// DT Mod containers
const dtSectionPart1El = document.getElementById("dt-section-part-1")
const dtSectionPart2El = document.getElementById("dt-section-part-2")
const dtSection3MapsEl = document.getElementById("dt-section-3-maps")
// FM Mod containers
const fmSection4MapsPart1El = document.getElementById("fm-section-4-maps-part-1")
const fmSection4MapsPart2El = document.getElementById("fm-section-4-maps-part-2")
const fmSection3MapsEl = document.getElementById("fm-section-3-maps")
const fmSection2MapsPart1El = document.getElementById("fm-section-2-maps-part-1")
const fmSection2MapsPart2El = document.getElementById("fm-section-2-maps-part-2")
// Mappool Tags
const nmMappoolTagEl = document.getElementById("nm-mappool-tag")
const dtMappoolTagEl = document.getElementById("dt-mappool-tag")
const fmMappoolTagEl = document.getElementById("fm-mappool-tag")
// Mappool Section Titles
const nmSectionTitleEl = document.getElementById("nm-section-title")
const dtSectionTitleEl = document.getElementById("dt-section-title")
const fmSectionTitleEl = document.getElementById("fm-section-title")

// Render maps
function renderMaps() {
    // Set mod information
    const noOfNMMaps = noOfMapsFromMod("NM")
    const noOfDTMaps = noOfMapsFromMod("DT")
    const noOfFMMaps = noOfMapsFromMod("FM")

    for (let i = 0; i < allBeatmaps.length - 1; i++) {
        let currentModContainers = []
        const currentMap = allBeatmaps[i]
        let currentNoOfMaps
        
        // NM mod container
        // NM
        if (currentMap.mod === "NM" && noOfNMMaps === 6) {
            currentModContainers.push(nmSectionPart1El, nmSectionPart2El)
            currentNoOfMaps = noOfNMMaps
        } else if (currentMap.mod === "NM") {
            currentModContainers.push(nmSection5MapsEl)
            nmMappoolTagEl.classList.add("nm-mappool-tag-5-maps")
            nmSectionTitleEl.classList.add("nm-section-title-5-maps")
            currentNoOfMaps = noOfNMMaps
        }
        // HD
        else if (currentMap.mod === "HD") {
            currentModContainers.push(hdSectionEl)
        }
        // HR
        else if (currentMap.mod === "HR") {
            currentModContainers.push(hrSectionEl)
        }
        // DT
        else if (currentMap.mod === "DT" && noOfDTMaps === 4) {
            currentModContainers.push(dtSectionPart1El, dtSectionPart2El)
            dtMappoolTagEl.classList.add("dt-mappool-tag-4-maps")
            dtSectionTitleEl.classList.add("dt-section-title-4-maps")
            currentNoOfMaps = noOfDTMaps
        } else if (currentMap.mod === "DT") {
            currentModContainers.push(dtSection3MapsEl)
        }
        //FM
        else if (currentMap.mod === "FM" && noOfFMMaps === 4) {
            currentModContainers.push(fmSection4MapsPart1El, fmSection4MapsPart2El)
            fmMappoolTagEl.classList.add("fm-mappool-tag-4-maps")
            fmSectionTitleEl.classList.add("fm-section-title-4-maps")
            currentNoOfMaps = noOfFMMaps
        } else if (currentMap.mod === "FM" && noOfFMMaps === 3) {
            currentModContainers.push(fmSection3MapsEl)
        } else if (currentMap.mod === "FM" && noOfFMMaps === 2) {
            currentModContainers.push(fmSection2MapsPart1El, fmSection2MapsPart2El)
            fmMappoolTagEl.classList.add("fm-mappool-tag-2-maps")
            fmSectionTitleEl.classList.add("fm-section-title-2-maps")
            currentNoOfMaps = noOfFMMaps
        }

        // Map Tile
        const mapTile = document.createElement("div")
        mapTile.classList.add("map-tile")
        mapTile.addEventListener("mousedown", mapClickEvent)
        mapTile.addEventListener("contextmenu", event => event.preventDefault())
        mapTile.setAttribute("id", currentMap.beatmap_id)

        // Map Background
        const mapBackground = document.createElement("div")
        mapBackground.classList.add("map-background")
        mapBackground.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`

        // Map Background Overlay
        const mapBackgroundOverlay = document.createElement("div")
        mapBackgroundOverlay.classList.add("map-background-overlay")

        // Pick Ban Protect Overlay
        const pickBanProtectOverlay = document.createElement("div")
        pickBanProtectOverlay.classList.add("pick-ban-protect-overlay")
        const pickBanProtectImage = document.createElement("img")
        pickBanProtectImage.setAttribute("src", "https://osuflags.omkserver.nl/US-42.png")
        pickBanProtectImage.classList.add("pick-ban-protect-image")
        const pickBanProtectText = document.createElement("div")
        pickBanProtectText.classList.add("pick-ban-protect-text")
        pickBanProtectText.textContent = "PROTECT"

        // Map Identifier Section
        const mapIdentifierSection = document.createElement("div")
        mapIdentifierSection.classList.add("map-identifier-section")
        const mapWarpImage = document.createElement("img")
        mapWarpImage.setAttribute("src", `static/mappool-warp-font/${currentMap.mod}${currentMap.order}.png`)
        const mapIdentifierImage = document.createElement("img")
        mapIdentifierImage.setAttribute("src", `static/mappool-font/${currentMap.mod}${currentMap.order}.png`)
        mapIdentifierImage.classList.add("map-identifier-title-font")
        mapIdentifierSection.append(mapWarpImage, mapIdentifierImage)

        // Song Metadata
        const mapSongTitle = document.createElement("div")
        mapSongTitle.classList.add("map-song-metadata", "map-song-title")
        mapSongTitle.textContent = `[${currentMap.title}`
        const mapSongArtist = document.createElement("div")
        mapSongArtist.classList.add("map-song-metadata", "map-song-artist")
        mapSongArtist.innerHTML = `${currentMap.artist} <span class="map-song-artist-end">]</span>`

        // Append everything
        pickBanProtectOverlay.append(pickBanProtectImage, pickBanProtectText)
        mapBackground.append(mapBackgroundOverlay, pickBanProtectOverlay, mapIdentifierSection)
        mapTile.append(mapBackground, mapSongTitle, mapSongArtist)
        
        currentModContainers[(currentModContainers.length > 1 && currentMap.order > currentNoOfMaps / 2) ? 1 : 0].append(mapTile)
    }
}
const noOfMapsFromMod = mod => allBeatmaps.filter(map => map.mod === mod).length

const svgs = {
    protect: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512"><path fill="#000000" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/></svg>`,
    ban: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 384 512"><path fill="#000000" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
    pick: `<svg class="pickBanProtectSVG" xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 448 512"><path fill="#000000" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>`
}

// Map Click Event
function mapClickEvent(event) {
    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"
    if (event.shiftKey) action = "protect"
    if (event.altKey) action = "clear"

    // Pick Ban Protect Container
    const pickBanProtectContainer = this.children[0].children[1]
    const tileBackgroundOverlay = this.children[0].children[0]
    const normalOverlay = "rgba(0,0,0,0.5)"
    const darkOverlay = "rgba(0,0,0,0.8)"
    tileBackgroundOverlay.style.backgroundColor = normalOverlay
    console.log(pickBanProtectContainer)

    // Remove map
    if (action  === "clear") {
        pickBanProtectContainer.classList.remove("pick-ban-protect-overlay-keyframe")
        pickBanProtectContainer.style.clipPath = "polygon(0% 0%, 0% 100%, 0% 100%, 0% 0%)"
    } else {
        // Add correct classes
        pickBanProtectContainer.classList.add("pick-ban-protect-overlay-keyframe")
        pickBanProtectContainer.classList.remove("pick-ban-protect-overlay-protect")
        pickBanProtectContainer.classList.remove("pick-ban-protect-overlay-pick")
        pickBanProtectContainer.classList.remove("pick-ban-protect-overlay-ban")
        pickBanProtectContainer.classList.add(`pick-ban-protect-overlay-${action}`)

        // Add flag
        const currentCountry = findCountryByName(team === "red" ? currentRedCountryName : currentBlueCountryName)
        pickBanProtectContainer.children[0].setAttribute("src", `https://osuflags.omkserver.nl/${currentCountry.flag_code}-42.png`)

        // Add text
        pickBanProtectContainer.children[1].textContent = action.toUpperCase()

        // Remove existing svgs
        while (pickBanProtectContainer.childElementCount > 2) {
            pickBanProtectContainer.lastElementChild.remove()
        }

        // Add new svg
        pickBanProtectContainer.innerHTML += svgs[action]

        // Dark overlay for bans
        if (action === "ban") tileBackgroundOverlay.style.backgroundColor = darkOverlay

        // Set cookie for picks
        if (action !== "pick") return
        document.cookie = `currentTeamPick=${team}; path=/`
        if (team === "red") currentPickerRedEl.click()
        else currentPickerBlueEl.click()
    }
}

// Country
const redCountryFlagEl = document.getElementById("red-country-flag")
const redCountryNameEl = document.getElementById("red-country-name")
const blueCountryFlagEl = document.getElementById("blue-country-flag")
const blueCountryNameEl = document.getElementById("blue-country-name")
let currentRedCountryName, currentBlueCountryName

// Chat Display
const chatContainerEl = document.getElementById("chat-container")
let chatLen

// Beatmap ID
let beatmapID
let currentIpcState
let currentMappoolBeatmap
let hasAutopicked = false

// Winner
let checkedWinner = false

// Tiebreaker Trigger
let tiebreakerTriggered = false
let tiebreakerTriggeredAuto = false

// Socket
const socket = createTosuWsSocket()
socket.onmessage = async event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Set Country Details
    if (currentRedCountryName !== data.tourney.team.left) {
        currentRedCountryName = setCountryDetails(data.tourney.team.left, redCountryNameEl, redCountryFlagEl)
    }
    if (currentBlueCountryName !== data.tourney.team.right) {
        currentBlueCountryName = setCountryDetails(data.tourney.team.right, blueCountryNameEl, blueCountryFlagEl)
    }

    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.chat.length) ? (chatContainerEl.innerHTML = "", chatLen = 0) : null
        const fragment = document.createDocumentFragment()

        for (let i = chatLen; i < data.tourney.chat.length; i++) {
            const chatColour = data.tourney.chat[i].team

            // Chat message container
            const chatMessageContainer = document.createElement("div")
            chatMessageContainer.classList.add("message-container")

            // Name
            const chatDisplayName = document.createElement("span")
            chatDisplayName.classList.add("message-name")
            chatDisplayName.classList.add(chatColour)
            chatDisplayName.innerText = data.tourney.chat[i].name + ": ";

            // Message
            const chatDisplayMessage = document.createElement("span")
            chatDisplayMessage.classList.add("message-content")
            chatDisplayMessage.innerText = data.tourney.chat[i].message

            chatMessageContainer.append(chatDisplayName, chatDisplayMessage)
            fragment.append(chatMessageContainer)
        }

        chatContainerEl.append(fragment)
        chatLen = data.tourney.chat.length
        chatContainerEl.scrollTop = chatContainerEl.scrollHeight
    }

    if (beatmapID !== data.beatmap.id && data.beatmap.id !== 0 && allBeatmaps) { 
        beatmapID = data.beatmap.id
        currentMappoolBeatmap = findBeatmap(beatmapID)
        const targetElement = document.getElementById(`${beatmapID}`)

        if (document.contains(targetElement) && isAutopickOn && !hasAutopicked) {
            const isRed = nextAutopickNextEl.innerText === 'RED'
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: isRed ? 0 : 2
            })
            targetElement.dispatchEvent(event)
            setAutopicker(isRed ? 'Blue' : 'Red')
            hasAutopicked = true
        }

        if (currentMappoolBeatmap.mod === "TB" && !preloadedWithBg) {
            // Set tiebreaker information
            const tbImagePath = `http://127.0.0.1:24050/Songs/${data.directPath.beatmapBackground}`
            const filePathFound = await urlAccessible(`${tbImagePath}`)
            tiebreakerCellEl.style.backgroundImage = `url(${filePathFound ? tbImagePath : `https://assets.ppy.sh/beatmaps/${currentMappoolBeatmap.beatmapset_id}/covers/cover.jpg`})`
            triggerTiebreaker(true)
        }
    }

    if (currentIpcState === 2 || currentIpcState === 3) {
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

        // currentLeftTeamScore = data.tourney.totalScore.left
        // currentRightTeamScore = data.tourney.totalScore.right
    }

    // IPC State
    if (currentIpcState !== data.tourney.ipcState) {
        currentIpcState = data.tourney.ipcState

        if (currentIpcState === 4) {
            hasAutopicked = false
            tiebreakerTriggeredAuto = false

            if (!checkedWinner && currentMappoolBeatmap) {
                checkedWinner = true
                if (currentLeftTeamScore > currentRightTeamScore) {
                    setStarRedPlusEl.click()
                } else if (currentRightTeamScore > currentLeftTeamScore) {
                    setStarBluePlusEl.click()
                }
            }
        } else {
            checkedWinner = false
        }
    }

    // Tiebreaker Triggered Auto
    const firstTo = Number(getCookie("firstTo"))
    if (Number(getCookie("redStarCount")) >= firstTo - 1 && Number(getCookie("blueStarCount")) >= firstTo - 1 && !tiebreakerTriggeredAuto) {
        tiebreakerTriggeredAuto = true
        if (!tiebreakerTriggered) {
            triggerTiebreaker(true)
        }
    }
}

// Set Country Details
function setCountryDetails(countryName, countryNameEl, countryFlagEl) {
    const currentCountry = findCountryByName(countryName)
    countryNameEl.textContent = countryName.toUpperCase()
    if (currentCountry) {
        countryFlagEl.style.display = "block"
        countryFlagEl.style.backgroundImage = `url("https://osuflags.omkserver.nl/${currentCountry.flag_code}-300.png")`
    } else {
        countryFlagEl.style.display = "none"
    }
    return countryName
}

// Trigger Tiebreaker
function triggerTiebreaker(value) {
    tiebreakerTriggered = value
    if (tiebreakerTriggered) {
        tiebreakerCellEl.classList.add("tiebreaker-cell-keyframe-open")
        tiebreakerCellEl.classList.remove("tiebreaker-cell-keyframe-close")
    } else {
        tiebreakerCellEl.classList.remove("tiebreaker-cell-keyframe-open")
        tiebreakerCellEl.classList.add("tiebreaker-cell-keyframe-close")
    }
}

// Update Star Count Buttons
const setStarRedPlusEl = document.getElementById("set-star-red-plus")
const setStarRedMinusEl = document.getElementById("set-star-red-minus")
const setStarBluePlusEl = document.getElementById("set-star-blue-plus")
const setStarBlueMinusEl = document.getElementById("set-star-blue-minus")

// Next autopick
const nextAutopickNextEl = document.getElementById("next-autopick-text")
const nextAutopickRedEl = document.getElementById("next-autopick-red")
const nextAutopickBlueEl = document.getElementById("next-autopick-blue")
const toggleAutopickButtonEl = document.getElementById("toggle-autopick-button")
const toggleAutopickOnOffEl = document.getElementById("toggle-autopick-on-off")
let isAutopickOn = false, currentPicker = "none"

// Toggle stars button
const toggleStarButtonEl = document.getElementById("toggle-stars-button")
const toggleStarsOnOffEl = document.getElementById("toggle-stars-on-off")

// Setting current picker
const currentPickerTextEl = document.getElementById("current-picker-text")
const currentPickerRedEl = document.getElementById("current-picker-red")
const currentPickerBlueEl = document.getElementById("current-picker-blue")
const currentPickerNoneEl = document.getElementById("current-picker-none")

document.addEventListener("DOMContentLoaded", () => {
    toggleStarButtonEl.addEventListener("click", () => toggleStars(toggleStarsOnOffEl, toggleStarButtonEl, redTeamStarContainerEl, blueTeamStarContainerEl))
    document.cookie = `toggleStarContainers=${true}; path=/`

    // Update star count buttons
    setStarRedPlusEl.addEventListener("click", () => updateStarCount("red", "plus", redTeamStarContainerEl, blueTeamStarContainerEl, currentRedCountryName, currentBlueCountryName))
    setStarRedMinusEl.addEventListener("click", () => updateStarCount("red", "minus", redTeamStarContainerEl, blueTeamStarContainerEl, currentRedCountryName, currentBlueCountryName))
    setStarBluePlusEl.addEventListener("click", () => updateStarCount("blue", "plus", redTeamStarContainerEl, blueTeamStarContainerEl, currentRedCountryName, currentBlueCountryName))
    setStarBlueMinusEl.addEventListener("click", () => updateStarCount("blue", "minus", redTeamStarContainerEl, blueTeamStarContainerEl, currentRedCountryName, currentBlueCountryName))

    // Toggle Autopick button
    toggleAutopickButtonEl.addEventListener("click", function() {
        isAutopickOn = !isAutopickOn
        toggleAutopickOnOffEl.textContent = isAutopickOn ? "ON" : "OFF"
        toggleAutopickButtonEl.classList.toggle("toggle-on", isAutopickOn)
        toggleAutopickButtonEl.classList.toggle("toggle-off", !isAutopickOn)
    })

    // Set Autopicker Buttons
    nextAutopickRedEl.addEventListener("click", () => setAutopicker("red"))
    nextAutopickBlueEl.addEventListener("click",() => setAutopicker("blue"))

    // Current Picker
    currentPickerRedEl.addEventListener("click", () => updateCurrentPicker("red"))
    currentPickerBlueEl.addEventListener("click", () => updateCurrentPicker("blue"))
    currentPickerNoneEl.addEventListener("click", () => updateCurrentPicker("none"))
    currentPickerNoneEl.click()

    autoadvance_button.addEventListener("click", () => switchAutoAdvance())
})
function updateCurrentPicker(side) {
    currentPickerTextEl.textContent = side.toUpperCase()
    document.cookie = `currentPicker=${side}; path=/`
}

// Set Autopicker
function setAutopicker(picker) {
    currentPicker = picker
    nextAutopickNextEl.textContent = picker.toUpperCase()
}

// Updating Score
const currentScoreLeftEl = document.getElementById("current-score-left")
const currentScoreRightEl = document.getElementById("current-score-right")
setInterval(() => {
    currentScoreLeftEl.textContent = getCookie("redStarCount")
    currentScoreRightEl.textContent = getCookie("blueStarCount")
}, 50)

// OBS Information
const sceneCollection = document.getElementById("sceneCollection")
let autoadvance_button = document.getElementById('auto-advance-button')
let autoadvance_timer_container = document.getElementById('autoAdvanceTimer')
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel')
const pick_to_transition_delay_ms = 10000;
let enableAutoAdvance = false
const gameplay_scene_name = "Gameplay Scene"
const mappool_scene_name = "Mappool Scene"
const winner_scene_name = "Winner Scene"

let sceneTransitionTimeoutID;

autoadvance_timer_container.style.opacity = '0';


function switchAutoAdvance() {
    enableAutoAdvance = !enableAutoAdvance
    if (enableAutoAdvance) {
        autoadvance_button.innerText = 'AUTO ADVANCE: ON'
    } else {
        autoadvance_button.innerText = 'AUTO ADVANCE: OFF'
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

    let autoadvance_timer_time = new CountUp('autoAdvanceTimerTime',
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
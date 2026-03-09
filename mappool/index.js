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

// Extract Beatmap Data
let allBeatmaps
async function getBetmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data

    // Set star
    let bestOf = 0
    switch (allBeatmaps) {
        case "GROUP STAGE":
            bestOf = 9
            break
        case "ROUND OF 16": case "QUARTERFINALS": case "SEMIFINALS":
            bestOf = 11
            break
        default:
            bestOf = 13
    }

    // Set default star count
    setDefaultStarCount(bestOf, redTeamStarContainerEl, blueTeamStarContainerEl)
}
getBetmaps()

// Country
const redCountryFlagEl = document.getElementById("red-country-flag")
const redCountryNameEl = document.getElementById("red-country-name")
const blueCountryFlagEl = document.getElementById("blue-country-flag")
const blueCountryNameEl = document.getElementById("blue-country-name")
let currentRedCountryName, currentBlueCountryName

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Set Country Details
    if (currentRedCountryName !== data.tourney.team.left) {
        currentRedCountryName = setCountryDetails(data.tourney.team.left, redCountryNameEl, redCountryFlagEl)
    }
    if (currentBlueCountryName !== data.tourney.team.right) {
        currentBlueCountryName = setCountryDetails(data.tourney.team.right, blueCountryNameEl, blueCountryFlagEl)
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
})

// Setting current picker
const currentPickerTextEl = document.getElementById("current-picker-text")
const currentPickerRedEl = document.getElementById("current-picker-red")
const currentPickerBlueEl = document.getElementById("current-picker-blue")
const currentPickerNoneEl = document.getElementById("current-picker-none")
function updateCurrentPicker(side) {
    currentPickerTextEl.textContent = side
    document.cookie = `currentPicker=${side}; path=/`
}

// Set Autopicker
function setAutopicker(picker) {
    currentPicker = picker
    nextAutopickNextEl.textContent = `${currentPicker.substring(0, 1).toUpperCase()}${currentPicker.substring(1)}`
}
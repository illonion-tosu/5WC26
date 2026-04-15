// Bar
const teamStatsSectionBarAimLeftEl = document.getElementById("team-stats-section-bar-aim-left")
const teamStatsSectionBarAimRightEl = document.getElementById("team-stats-section-bar-aim-right")
const teamStatsSectionBarSpeedLeftEl = document.getElementById("team-stats-section-bar-speed-left")
const teamStatsSectionBarSpeedRightEl = document.getElementById("team-stats-section-bar-speed-right")
const teamStatsSectionBarStaminaLeftEl = document.getElementById("team-stats-section-bar-stamina-left")
const teamStatsSectionBarStaminaRightEl = document.getElementById("team-stats-section-bar-stamina-right")
const teamStatsSectionBarFcLeftEl = document.getElementById("team-stats-section-bar-fc-left")
const teamStatsSectionBarFcRightEl = document.getElementById("team-stats-section-bar-fc-right")
const teamStatsSectionBarPrecisionLeftEl = document.getElementById("team-stats-section-bar-precision-left")
const teamStatsSectionBarPrecisionRightEl = document.getElementById("team-stats-section-bar-precision-right")
const teamStatsSectionBarReadingLeftEl = document.getElementById("team-stats-section-bar-reading-left")
const teamStatsSectionBarReadingRightEl = document.getElementById("team-stats-section-bar-reading-right")
const teamStatsSectionBarTechnicalLeftEl = document.getElementById("team-stats-section-bar-technical-left")
const teamStatsSectionBarTechnicalRightEl = document.getElementById("team-stats-section-bar-technical-right")

// Numbers
const teamStatsSectionNumberAimLeftEl  = document.getElementById("team-stats-section-number-aim-left")
const teamStatsSectionNumberAimRightEl = document.getElementById("team-stats-section-number-aim-right")
const teamStatsSectionNumberSpeedLeftEl  = document.getElementById("team-stats-section-number-speed-left")
const teamStatsSectionNumberSpeedRightEl = document.getElementById("team-stats-section-number-speed-right")
const teamStatsSectionNumberStaminaLeftEl  = document.getElementById("team-stats-section-number-stamina-left")
const teamStatsSectionNumberStaminaRightEl = document.getElementById("team-stats-section-number-stamina-right")
const teamStatsSectionNumberFcLeftEl  = document.getElementById("team-stats-section-number-fc-left")
const teamStatsSectionNumberFcRightEl = document.getElementById("team-stats-section-number-fc-right")
const teamStatsSectionNumberPrecisionLeftEl  = document.getElementById("team-stats-section-number-precision-left")
const teamStatsSectionNumberPrecisionRightEl = document.getElementById("team-stats-section-number-precision-right")
const teamStatsSectionNumberReadingLeftEl  = document.getElementById("team-stats-section-number-reading-left")
const teamStatsSectionNumberReadingRightEl = document.getElementById("team-stats-section-number-reading-right")
const teamStatsSectionNumberTechnicalLeftEl  = document.getElementById("team-stats-section-number-technical-left")
const teamStatsSectionNumberTechnicalRightEl = document.getElementById("team-stats-section-number-technical-right")

// Get teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/predictions.json")
    const responseJson = await response.json()
    allTeams = responseJson    
}
const findTeam = country_name => allTeams.find(t => t.country_name.toLowerCase() === country_name)

// Get teams
let allStats
async function getStats() {
    const response = await fetch("../_data/team-stats.json")
    const responseJson = await response.json()
    allStats = responseJson    
}
const findStats = country_name => allStats.find(t => t.team_name.toLowerCase() === country_name)

// Get teams
let allCountries
async function getCountries() {
    const response = await fetch("../_data/countries.json")
    const responseJson = await response.json()
    allCountries = responseJson    
}

getTeams()
getStats()
getCountries()

// Set Details
const countryEl = document.getElementById("country")
const sideEl = document.getElementById("side")
let colour
function setDetails() {
    colour = sideEl.value === "left" ? "red" : "blue"

    // Set Team Flag
    const teamFlag = document.getElementById(`${colour}-team-flag`)
    const currentTeam = findTeam(countryEl.value)
    teamFlag.setAttribute("src", `https://osuflags.omkserver.nl/${currentTeam.flag_code}-163.png`)

    // Set Country Name
    const teamText = document.getElementById(`${colour}-team-name`)
    let currentTeamName = countryEl.value
    switch (currentTeamName) {
        case "russian federation": currentTeamName = "RUSSIA"; break;
        case "united states": currentTeamName = "U.S.A"; break;
        case "united kingdom": currentTeamName = "U. KINGDOM"; break;
        default: currentTeamName = currentTeamName
    }
    teamText.textContent = currentTeamName.toUpperCase()

    // Team Stats Bar
    const stats = findStats(countryEl.value)
    document.getElementById(`team-stats-section-bar-aim-${sideEl.value}`).style.width = `${stats.aim * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-speed-${sideEl.value}`).style.width = `${stats.speed * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-stamina-${sideEl.value}`).style.width = `${stats.stamina * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-fc-${sideEl.value}`).style.width = `${stats.finger_control * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-precision-${sideEl.value}`).style.width = `${stats.precision * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-reading-${sideEl.value}`).style.width = `${stats.reading * 345 / 10}px`
    document.getElementById(`team-stats-section-bar-technical-${sideEl.value}`).style.width = `${stats.technical * 345 / 10}px`
    // Stat Numbers
    document.getElementById(`team-stats-section-number-aim-${sideEl.value}`).textContent = Math.round(stats.aim * 100) / 100
    document.getElementById(`team-stats-section-number-speed-${sideEl.value}`).textContent = Math.round(stats.speed * 100) / 100
    document.getElementById(`team-stats-section-number-stamina-${sideEl.value}`).textContent = Math.round(stats.stamina * 100) / 100
    document.getElementById(`team-stats-section-number-fc-${sideEl.value}`).textContent = Math.round(stats.finger_control * 100) / 100
    document.getElementById(`team-stats-section-number-precision-${sideEl.value}`).textContent = Math.round(stats.precision * 100) / 100
    document.getElementById(`team-stats-section-number-reading-${sideEl.value}`).textContent = Math.round(stats.reading * 100) / 100
    document.getElementById(`team-stats-section-number-technical-${sideEl.value}`).textContent = Math.round(stats.technical * 100) / 100

    // Player Names
    const playerNamesContainer = document.getElementById(`players-names-container-${sideEl.value}`)
    playerNamesContainer.innerHTML = ""
    for (let i = 0; i < currentTeam.current_year.length; i++) {
        const div = document.createElement("div")
        div.textContent = currentTeam.current_year[i]
        playerNamesContainer.append(div)
    }
}
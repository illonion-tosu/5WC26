// Extract Country Data
let allCountries
async function getCountries() {
    const response = await axios.get("../_data/predictions.json")
    allCountries = response.data
    return allCountries
}
getCountries()
const findCountryByName = (name) => allCountries.find((c) => c.country_name.toLowerCase() === name.toLowerCase())

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
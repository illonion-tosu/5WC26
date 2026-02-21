// DOM Elements
const elements = {
    countdown: {
        minutes: document.getElementById("minutes-number"),
        seconds: document.getElementById("seconds-number"),
        errorMessage: document.getElementById("timer1-error-message")
    },
    utc: {
        hours: document.getElementById("hours-number-utc"),
        minutes: document.getElementById("minutes-number-utc"),
        errorMessage: document.getElementById("timer2-error-message")
    },
    display: document.getElementById("timer"),
    timerContainer: document.getElementById("timer-container")
}

// Countdown Timer
class CountdownTimer {
    constructor() {
        this.intervalId = null
        this.remainingSeconds = 0
    }

    setAndStart() {
        this.setTime()
        this.start()
        showTimer()
    }

    setTime() {
        const minutesValue = Number(elements.countdown.minutes.value)
        const minutesNumber = Math.floor(minutesValue)
        const secondsValue = Number(elements.countdown.seconds.value)
        
        this.remainingSeconds = Math.round(secondsValue) + 
                              minutesNumber * 60 + 
                              Math.round((minutesValue - minutesNumber) * 60)

        if (this.remainingSeconds < 0) {
            elements.countdown.errorMessage.style.display = "block"
            elements.utc.errorMessage.style.display = "none"
            return
        }

        elements.countdown.errorMessage.style.display = "none"
        this.updateDisplay()
        showTimer()
        this.stop()
    }

    start() {
        this.stop()
        showTimer()
        
        if (this.remainingSeconds > 0) {
            this.intervalId = setInterval(() => {
                this.remainingSeconds--
                this.updateDisplay()
                
                if (this.remainingSeconds <= 0) this.stop()
            }, 1000)
        }
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        showTimer()
    }

    reset() {
        this.stop()
        this.remainingSeconds = 0
        elements.display.textContent = "00:00"
    }

    updateDisplay() {
        const hours = Math.floor(this.remainingSeconds / 3600)
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60)
        const seconds = this.remainingSeconds % 60

        elements.display.textContent = hours >= 1
            ? formatTime(hours, minutes, seconds)
            : formatTime(minutes, seconds)
    }
}

// UTC Timer
class UTCTimer {
    constructor() {
        this.intervalId = null
        this.targetTime = null
    }

    start() {
        this.stop()
        showTimer()
        
        const hours = Number(elements.utc.hours.value) || 0
        const minutes = Number(elements.utc.minutes.value) || 0

        if (hours < 0 || minutes < 0) {
            elements.countdown.errorMessage.style.display = "none"
            elements.utc.errorMessage.style.display = "block"
            return
        }
        
        const now = new Date()
        now.setUTCHours(hours, minutes, 0)
        this.targetTime = now.getTime()
        
        this.updateDisplay()
        this.intervalId = setInterval(() => this.updateDisplay(), 1000)
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        showTimer()
    }

    updateDisplay() {
        const currentTime = new Date().getTime()
        let timeDiff = this.targetTime - currentTime
        
        if (timeDiff < 0) {
            this.targetTime += 24 * 60 * 60 * 1000
            return this.updateDisplay()
        }
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
        
        elements.display.textContent = formatTime(hours, minutes, seconds)
        if (hours === 0) elements.display.textContent = formatTime(minutes, seconds)
    }
}

// Helper function for consistent time formatting
function formatTime(...parts) {
    return parts.map(part => String(part).padStart(2, '0')).join(':')
}

// Show Timer
function showTimer() {
    elements.timerContainer.style.display = "block"
}

// Remove Timer
function removeTimer() {
    elements.timerContainer.style.display = "none"
}

// Create timer instances
const countdownTimer = new CountdownTimer()
const utcTimer = new UTCTimer()

// Global functions for HTML buttons
window.setAndStartTimer = () => countdownTimer.setAndStart()
window.setMinuteSecondTimer = () => countdownTimer.setTime()
window.startTimer = () => countdownTimer.start()
window.stopTimer = () => {
    countdownTimer.stop()
    utcTimer.stop()
}
window.resetTimer = () => countdownTimer.reset()
window.startUTCTimer = () => {
    countdownTimer.reset()
    utcTimer.start()
}

// Set Stream Idle Text
const streamIdleTextEl = document.getElementById("stream-idle-text")
function setStreamIdleText(streamIdleString) {
    removeTeamsText()
    streamIdleTextEl.style.display = "block"
    streamIdleTextEl.innerHTML = streamIdleString.split(/\s+/).join("<br>").toUpperCase()
}

// Remove stream Idle Text
function removeStreamIdleText() {
    streamIdleTextEl.style.display = "none"
}

// Set Teams Text 
const teamsTextEl = document.getElementById("teams-text")
const sidebarRedTeamEl = document.getElementById("sidebar-red-team")
const sidebarBlueTeamEl = document.getElementById("sidebar-blue-team")
const teamVsErrorMessageEl = document.getElementById("team-vs-error-message")

const leftTeamTextEl = document.getElementById("left-team-text")
const rightTeamTextEl = document.getElementById("right-team-text")
const vsTextEl = document.getElementById("vs-text")
function setTeamsText() {
    // Validate teams text
    if (sidebarRedTeamEl.value.trim() === "" || sidebarBlueTeamEl.value.trim() === "") {
        teamVsErrorMessageEl.style.display = "block"
        return
    }
    teamVsErrorMessageEl.style.display = "none"

    // Show teams text
    removeStreamIdleText()
    teamsTextEl.style.display = "block"

    // Set teams text
    leftTeamTextEl.textContent = sidebarRedTeamEl.value.trim().toUpperCase()
    rightTeamTextEl.textContent = sidebarBlueTeamEl.value.trim().toUpperCase()

    // Set rights
    const rightTeamTextWidth = rightTeamTextEl.getBoundingClientRect().width
    vsTextEl.style.right = `${38 + rightTeamTextWidth / 2 - 43}px`
    leftTeamTextEl.style.right = `${38 + rightTeamTextWidth / 3}px`
}

// Remove teams text
function removeTeamsText() {
    teamsTextEl.style.display = "none"
}
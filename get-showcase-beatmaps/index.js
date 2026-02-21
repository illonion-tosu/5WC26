const textareaEl = document.getElementById("textarea")
let beatmaps = []
async function submit() {
    const textareaElValue = textareaEl.value
    const textAreaElValueSplit = textareaElValue.split("\n")
    for (let i = 1; i < textAreaElValueSplit.length; i++) {
        const textareaValueIndividual = textAreaElValueSplit[i].split("|")
        const response = await fetch(`https://tryz.vercel.app/api/b/${textareaValueIndividual[0]}`)
        const responseJson = await response.json()
        let beatmapInformation
        for (let i = 0; i < responseJson.beatmaps.length; i++) {
            if (responseJson.beatmaps[i].id == textareaValueIndividual[0]) {
                beatmapInformation = responseJson.beatmaps[i]
            }
        }

        let mapperString = ""
        for (let i = 0; i < beatmapInformation.owners.length; i++) {
            mapperString += beatmapInformation.owners[i].username
            if (i < beatmapInformation.owners.length - 2) {
                mapperString += ", "
            } else if (i === beatmapInformation.owners.length - 2) {
                mapperString += ", and "
            }
        }

        const beatmap = {
            "songName": responseJson.title,
            "difficultyName": beatmapInformation.version,
            "mapper": mapperString,
            "modId": `${textareaValueIndividual[1]}${textareaValueIndividual[2]}`
        }
        beatmaps.push(beatmap)
    }

    const jsonObject = {
        "roundName": textAreaElValueSplit[0],
        "beatmaps": beatmaps
    }

    const jsonString = JSON.stringify(jsonObject, null, 4)
    const blob = new Blob([jsonString], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "showcase-beatmaps.json"
    link.click()
}
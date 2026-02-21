const textarea = document.getElementById("textarea")
const teams = []
function submit() {
    const textareaValue = textarea.value
    const countries = textareaValue.split("\n")
    for (let i = 0; i < countries.length; i++) {
        const dataPoints = countries[i].split("\t")
        const teamObject = {
            "country_name": dataPoints[0],
            "flag_code": dataPoints[1],
            "last_seed": dataPoints[2],
            "last_placement": dataPoints[3],
            "played_before": dataPoints[4],
            "last_year": [
                [dataPoints[5]],
                [dataPoints[6]],
                [dataPoints[7]],
                [dataPoints[8]],
                [dataPoints[9]],
                [dataPoints[10]],
                [dataPoints[11]],
                [dataPoints[12]],
            ],
            "current_year": [
                dataPoints[13],
                dataPoints[14],
                dataPoints[15],
                dataPoints[16],
                dataPoints[17],
                dataPoints[18],
                dataPoints[19],
                dataPoints[20],
            ]
        }

        for (let i = 0; i < teamObject.last_year.length; i++) {
            if (teamObject.current_year.includes(teamObject.last_year[i][0])) {
                teamObject.last_year[i].push(true)
            } else {
                teamObject.last_year[i].push(false)
            }
        }

        teams.push(teamObject)
    }

    const jsonString = JSON.stringify(teams, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "predictions.json";
    link.click();
}
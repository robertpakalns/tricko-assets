// Use this script to generate the JSON file via Google Sheets API
// The JSON file will be uploaded to Google Drive and the download link will be printed in the console

if (!SpreadsheetApp) return console.log("Run this script in Google Sheets")

const TABLE = SpreadsheetApp.getActiveSpreadsheet()
const LENGTH = 531

const sheets = {
    ROTATION: TABLE.getSheetByName("ROTATION"),
    MAIN: TABLE.getSheetByName("MAIN"),
    MARKET: TABLE.getSheetByName("MARKET"),
    VERIFIED: TABLE.getSheetByName("VERIFIED")
}

const set = (sheet, mode) => {
    const headers = sheet.getRange(1, 2, 1, sheet.getLastColumn() - 1).getValues()[0]
    const data = sheet.getRange(2, 2, LENGTH, sheet.getLastColumn()).getValues()

    return data.map(row => {
        switch (mode) {
            case "last": return row.reverse().find(i => i !== "") || ""
            case "array": return JSON.stringify(Object.fromEntries(headers.map((h, i) => row[i] ? [h, row[i]] : null).filter(Boolean)))
            case "check": return row[headers.length - 1]
            case "boolarray": return JSON.stringify(Object.fromEntries(headers.map((h, i) => [h, row[i]])))
            default: return ""
        }
    })
}

const init = () => {
    const row5 = set(sheets.ROTATION, "check")
    const row6 = set(sheets.MARKET, "last")
    const row7 = set(sheets.VERIFIED, "last")
    const row9 = set(sheets.MARKET, "array")
    const row10 = set(sheets.VERIFIED, "array")
    const row11 = set(sheets.ROTATION, "boolarray")

    sheets.MAIN.getRange(2, 5, row5.length, 1).setValues(row5.map(i => [i]))
    sheets.MAIN.getRange(2, 6, row6.length, 1).setValues(row6.map(i => [i]))
    sheets.MAIN.getRange(2, 7, row7.length, 1).setValues(row7.map(i => [i]))

    const mainData = sheets.MAIN.getRange(2, 1, LENGTH, 9).getValues()

    // Database data
    const data = row5.map((item, i) => ({
        id: mainData[i][0],
        type: mainData[i][1],
        name: mainData[i][2],
        rarity: mainData[i][3],
        rotation: item,
        market: row6[i],
        verified: row7[i],
        _ma: row9[i],
        _va: row10[i],
        _ra: row11[i]
    }))

    // JSON file
    const json = {
        creationDate: new Date(),
        data: data
    }

    const blob = Utilities.newBlob(JSON.stringify(json, null, 2), "application/json", "voxiomMarket.json")
    const url = DriveApp.createFile(blob).getDownloadUrl()

    // Download link
    console.log(url)
}
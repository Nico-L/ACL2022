
// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  var sheetId = ""
  var isDefined = !!process.env.SHEET_GESTION_ID
  try {
    if (isDefined) {
      sheetId = process.env.SHEET_GESTION_ID
    } else {
      const doc = new GoogleSpreadsheet();
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
      const properties = {
        title: "gestion Drive"
      }
      await doc.createNewSpreadsheetDocument(properties)
      sheetId = doc.spreadsheetId
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ sheetId:  sheetId, isDefined: isDefined}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

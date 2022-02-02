
// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  const index = JSON.parse(event.queryStringParameters.index) || []
  const sheetId =  event.queryStringParameters.sheetId || process.env.SHEET_GESTION_ID
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo(); // loads sheets
    const ongletListeDossiers = doc.sheetsByTitle['dossiers']
    const rows = await ongletListeDossiers.getRows()
    await rows[index].delete()
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "updateOK"}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
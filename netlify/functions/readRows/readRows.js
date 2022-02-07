
// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  const onglet = event.queryStringParameters.onglet
  const sheetId = process.env.SHEET_GESTION_ID
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo(); // loads sheets
    const ongletListe = doc.sheetsByTitle[onglet]
    var retour = []
    if (ongletListe !== undefined) {
      const rows = await ongletListe.getRows()
      const headers = ongletListe.headerValues    
      rows.forEach((row)=> {
        var zeRow = {}
        headers.forEach((header) => zeRow[header] = row[header])
        retour.push(zeRow)
      })
    }
    
    
    return {
      statusCode: 200,
      body: JSON.stringify({data: retour}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

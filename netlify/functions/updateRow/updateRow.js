// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  const updateRow = JSON.parse(event.queryStringParameters.row) || []
  const indexRow = event.queryStringParameters.index || -1
  const onglet = event.queryStringParameters.onglet || "dossiers"
  const sheetId =  event.queryStringParameters.sheetId || process.env.SHEET_GESTION_ID
  try {
    var retour = []
    if (indexRow >= 0)
    {
      const doc = new GoogleSpreadsheet(sheetId);
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
      await doc.loadInfo(); // loads sheets
      const ongletListe = doc.sheetsByTitle[onglet]
      const rows = await ongletListe.getRows()
      Object.entries(updateRow).forEach(([key, value]) => {
          rows[indexRow][key] = value
      });
      await rows[indexRow].save()
      if (ongletListe !== undefined) {
        const headers = ongletListe.headerValues 
        rows.forEach((row)=> {
          var zeRow = {}
          headers.forEach((header) => zeRow[header] = row[header])
          retour.push(zeRow)
        })
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ data: retour}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }


// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  const sheetId = process.env.SHEET_GESTION_ID
  try {
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo(); // loads sheets
    const ongletListeDossiers = doc.sheetsByTitle['dossiers']
    var dossiers = []
    if (ongletListeDossiers !== undefined) {
      const rows = await ongletListeDossiers.getRows()
      rows.forEach((row)=> dossiers.push({nom: row.nom, folderId: row.folderId, inscriptions: row.inscriptions==='TRUE'?true:false, professeurs: row.professeurs==='TRUE'?true:false, sections: row.sections==='TRUE'?true:false}))
    }
    
    
    return {
      statusCode: 200,
      body: JSON.stringify({ dossiers: dossiers}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

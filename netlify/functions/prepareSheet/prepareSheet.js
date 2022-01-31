// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const idListeCampagnes = process.env.SHEET_LISTE_CAMPAGNES
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  try {
    const id = event.queryStringParameters.id || ''
    const nom = event.queryStringParameters.nom || ''
    const doc = new GoogleSpreadsheet(idListeCampagnes);
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
    await doc.loadInfo();
    const firstSheet = doc.sheetsByIndex[0];
    const ajoutCampagne = await firstSheet.addRow({ nom, id });
    await ajoutCampagne.save()
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello ${subject}` }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

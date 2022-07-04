// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
  try {
    const id = event.queryStringParameters.id || ''
    const header = JSON.parse(event.queryStringParameters.header) || []
    const doc = new GoogleSpreadsheet(id);
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
    await doc.loadInfo();
    const firstSheet = doc.sheetsByIndex[0];
    await firstSheet.setHeaderRow(header);
    return {
      statusCode: 200,
      body: JSON.stringify({ data: "ok" }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

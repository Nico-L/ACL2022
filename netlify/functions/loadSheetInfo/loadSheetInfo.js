// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');

const handler = async (event) => {
    try {
      const doc = new GoogleSpreadsheet('1aPoJHym8YR5BwuaWDBvf0mPUGTrbxI3QYkRryhYWvh8');
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
      await doc.loadInfo();
      const firstSheet = doc.sheetsByIndex[1];
      console.log('first sheet', firstSheet)
      await firstSheet.updateProperties({ title: 'bobby ?' });
      // create a sheet and set the header row
        //const sheet = await doc.addSheet({ headerValues: ['name', 'email'] });

        // append rows
        //const larryRow = await sheet.addRow({ name: 'Larry Page', email: 'larry@google.com' }).then((retour) => {console.log('retour', retour)});
        //const sheet = doc.sheetsByIndex[0]
      return {
        statusCode: 200,
        body: JSON.stringify({ sheet: 'bob'}),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    } catch (error) {
      return { statusCode: 500, body: error.toString() }
    }
  }
  
  module.exports = { handler }
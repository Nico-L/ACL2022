// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { google } = require('googleapis');

const handler = async (event) => {
    const jwtClient = new google.auth.JWT(
        process.env.EMAIL_SERVICE_GOOGLE,
        null,
        process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
        ['https://www.googleapis.com/auth/drive'],
        null
      );
      drive = google.drive({ version: "v3", auth: jwtClient });
      const fileMetadata = {
        'name': 'inscrits',
        'mimeType': 'application/vnd.google-apps.spreadsheet',
        parents: ['1fLxx_OkNVCX92OT-ztAEfq2IDBAhQj2A']
      };
      const spreadsheet = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      })
    return {
      statusCode: 200,
      body: JSON.stringify({ id: spreadsheet.data.id}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  }
  
  module.exports = { handler }
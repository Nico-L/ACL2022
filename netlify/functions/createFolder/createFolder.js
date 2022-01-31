// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { google } = require('googleapis');

const handler = async (event) => {
    try {
        const jwtClient = new google.auth.JWT(
            process.env.EMAIL_SERVICE_GOOGLE,
            null,
            process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
            ['https://www.googleapis.com/auth/drive'],
            null
          );
          drive = google.drive({ version: "v3", auth: jwtClient });
          const fileMetadata = {
            'name': '2021-2022',
            'mimeType': 'application/vnd.google-apps.folder',
            parents: ['1Jb46IIuwMOlmRfycVRkaVBpPLNQkADWr']
          };
          const folder = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
          })
          
      return {
        statusCode: 200,
        body: JSON.stringify({ id : folder.data.id}),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    } catch (error) {
      return { statusCode: 500, body: error.toString() }
    }
  }
  
  module.exports = { handler }
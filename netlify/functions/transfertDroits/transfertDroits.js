// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { google } = require('googleapis');

const handler = async (event) => {
  try {
    const id = event.queryStringParameters.id || ''
    const role = event.queryStringParameters.role || 'owner'
    const email = event.queryStringParameters.email || 'luchier@gmail.com'
    const jwtClient = new google.auth.JWT(
      process.env.EMAIL_SERVICE_GOOGLE,
      null,
      process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      ['https://www.googleapis.com/auth/drive'],
      null
    );
    drive = google.drive({ version: "v3", auth: jwtClient });
    const changeDroits = await drive.permissions.create({
      resource: {
        type: "user",
        emailAddress: email,
        role: role  // Please set the email address you want to give the permission.
      },
      transferOwnership: role === 'owner',
      fileId: id,
      fields: "id",
    }, function (err, file)  {
      if (err) {
        console.log('err', err)
      } else {
        console.log('retour', file)
      }
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "changement OK" }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

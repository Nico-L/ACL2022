// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const driveId = process.env.DRIVE_FOLDER_ID

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
    const response = await drive.files.list
        ({
            pageSize: 2,
            orderBy: 'createdTime desc',
            q: `'${driveId}' in parents and trashed=false and mimeType = 'application/vnd.google-apps.folder'`
        });
    let retour
    var promises = []
    if(response && response.data && response.data.files)
        {
          retour = response.data.files
          if (retour[0]) {
            promises.push(
              drive.files.list
                ({
                    pageSize: 150,
                    orderBy: 'name desc',
                    q: `'${retour[0].id}' in parents and trashed=false and mimeType = 'application/vnd.google-apps.folder'`
                })
            )
          }
          if (retour[1]) {
            promises.push(
              drive.files.list
                ({
                    pageSize: 150,
                    orderBy: 'name asc',
                    q: `'${retour[1].id}' in parents and trashed=false and mimeType = 'application/vnd.google-apps.folder'`
                })
            )
          }
        }
    if (promises.length > 0)
    {
      const retour2 = await Promise.all(promises)
      retour2.forEach((subFolders, index) => {
        if (subFolders && subFolders.data && subFolders.data.files) {
          retour[index].subfolders = subFolders.data.files
        } else {
          retour[index].subfolders = []
        }
      })
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ folders: retour}),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

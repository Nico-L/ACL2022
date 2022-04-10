// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');
import fetch from 'node-fetch';
const tokenSite = process.env.PUBLIC_TOKEN_SITE
const adresseFetch = "https://cms.labonnefabrique.fr/acl-inscriptions-campagnes?_sort=id:DESC&_limit=1&token=" + tokenSite
const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)
 const handlebars = require('handlebars');
 const fs = require('fs');

const fileName = "./netlify/functions/recupInscription/template/emailRecup.hbs"
const mjmlTemplateFile = fs.readFileSync(fileName, 'utf8');
const template = handlebars.compile(mjmlTemplateFile);

const handler = async (event) => {
  try {
    var isFound = false
    var textRetour = "uuid not found"
    const email = event.queryStringParameters.email ?? ""
    const leFetch = await fetch(adresseFetch, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store",
    });
    const campagne = await leFetch.json()
    const gSheetId = campagne[0].gSheetId
    const doc = new GoogleSpreadsheet(gSheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo();
    const firstSheet = doc.sheetsByIndex[0];
    const rows = await firstSheet.getRows();

    var adresse = "https://acl-sappey.netlify.app/inscriptions/?uuid="

    rows.forEach((row) => {
      if (row["email référent"] === email) {
        adresse = adresse + row.uuid
        isFound = true
        textRetour = "OK"
      }
    })

    if (isFound) {
      console.log('adresse', adresse)
      const hbsHtml = template({adresse: adresse});
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'nicolas@luchier.fr',
              Name: 'ACL',
            },
            To: [
              {
                Email: email
              },
            ],
            Subject: 'Lien vers votre inscription ACL',
            TextPart: 'Lien vers votre inscription ACL',
            HTMLPart: hbsHtml,
          },
        ],
      })
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: textRetour }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

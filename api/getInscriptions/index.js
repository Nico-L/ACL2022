// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');
import fetch from 'node-fetch';
const tokenSite = process.env.PUBLIC_TOKEN_SITE
const adresseFetch = "https://cms.labonnefabrique.fr/acl-inscriptions-campagnes?_sort=id:DESC&_limit=1&token=" + tokenSite

const handler = async (event) => {
  try {
    const uuid = event.queryStringParameters.uuid || ''
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
    const header = firstSheet.headerValues
    var resultats = []
    rows.forEach((row, index) => 
      {
        if (row.uuid === uuid) {
          const ligne = {}
        header.forEach((colonne) => {
          ligne[colonne] = row[colonne]
        })
        ligne.nrow = index
        resultats.push(ligne)
        }
      }
    )
    return {
      statusCode: 200,
      body: JSON.stringify({ data: JSON.stringify(resultats) }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

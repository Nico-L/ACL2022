// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');
import fetch from 'node-fetch';
const tokenSite = process.env.PUBLIC_TOKEN_SITE
const adresseFetch = {
  inscriptions: "https://cms.labonnefabrique.fr/acl-inscriptions-campagnes?_sort=id:DESC&_limit=1&token=" + tokenSite,
  stage: "https://cms.labonnefabrique.fr/acl-stage-inscriptions?_sort=id:DESC&_limit=1&token=" + tokenSite
}

const handler = async (event) => {
  const place = event.queryStringParameters.place || "inscriptions"
  const inscriptions = JSON.parse(event.queryStringParameters.inscriptions) || []
  //const effacer = event.queryStringParameters.effacer ? JSON.parse(event.queryStringParameters.effacer):[]
  const uuid = inscriptions[0].row[0]
  try {
    const leFetch = await fetch(adresseFetch[place], {
        method: "get",
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-store",
    });
    const campagne = await leFetch.json()
    const gSheetId = campagne[0].gSheetId
    //const titreColonnes = campagne[0].titreColonnes
    
    const doc = new GoogleSpreadsheet(gSheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo();
    var firstSheet = doc.sheetsByIndex[0];
    var rows = await firstSheet.getRows();
    let promises = []
    var n = 999
    while(n>0) {
      const rowsUuid = rows.filter((row) => row.uuid === uuid)
      n = rowsUuid.length
      if (n>0) {
        await rowsUuid[0].delete()
      }
      rows = await firstSheet.getRows();
    }

    var additions = []
    inscriptions.forEach((inscription) => {
      if (inscription.garder) {
        additions.push(inscription.row)
      }
    })
    if (additions.length > 0) {
      await firstSheet.addRows(additions)
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ data: "ok" }),
    }
  } catch (error) {
    console.log('erreur', error.toString())
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

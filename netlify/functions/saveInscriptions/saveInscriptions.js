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
  const effacer = event.queryStringParameters.effacer ? JSON.parse(event.queryStringParameters.effacer):[]
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
    const titreColonnes = campagne[0].titreColonnes
    
    const doc = new GoogleSpreadsheet(gSheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.EMAIL_SERVICE_GOOGLE,
      private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
    })
    await doc.loadInfo();
    const firstSheet = doc.sheetsByIndex[0];
    const rows = await firstSheet.getRows();
    let promises = []
    effacer.forEach((efface) => {
      promises.push(rows[efface].delete())
    })
    var additions = []
    inscriptions.forEach((inscription) => {
      if (inscription.hasOwnProperty('nrow')) {
        additions.push(inscription.row)
        promises.push(rows[inscription.nrow].delete())
        /*inscription.row.forEach((data, index) => {
          rows[inscription.nrow][titreColonnes[index].titre] = data
        })
        promises.push(rows[inscription.nrow].save()) */
      } else {
        additions.push(inscription)
      }
    })
    if (additions.length > 0) {
      promises.push(firstSheet.addRows(additions))
    }
    await Promise.all(promises)
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

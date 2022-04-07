// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const { GoogleSpreadsheet } = require('google-spreadsheet');
import fetch from 'node-fetch';
const tokenSite = process.env.PUBLIC_TOKEN_SITE
const adresseFetch = "https://cms.labonnefabrique.fr/acl-inscriptions-campagnes?_sort=id:DESC&_limit=1&token=" + tokenSite

const handler = async (event) => {
  try {
    //const id = event.queryStringParameters.id || ''
      const leFetch = await fetch(adresseFetch, {
          method: "get",
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store",
      });
      const campagne = await leFetch.json()
      const gSheetId = campagne[0].gSheetId
      const titreColonnes = campagne[0].titreColonnes
      const inscriptions = JSON.parse(event.queryStringParameters.inscriptions) || []
      const effacer = JSON.parse(event.queryStringParameters.effacer) || []
      const doc = new GoogleSpreadsheet(gSheetId);
      await doc.useServiceAccountAuth({
        client_email: process.env.EMAIL_SERVICE_GOOGLE,
        private_key: process.env.KEY_SERVICE_GOOGLE.replace(/\\n/g, "\n"),
      })
      await doc.loadInfo();
      const firstSheet = doc.sheetsByIndex[0];
      const rows = await firstSheet.getRows();
      try {
        effacer.forEach(async (efface) => {
          await rows[efface].delete()
        })
        inscriptions.forEach(async (inscription) => {
          if (inscription.hasOwnProperty('nrow')) {
            inscription.row.forEach((data, index) => {
              rows[inscription.nrow][titreColonnes[index].titre] = data
            })
            await rows[inscription.nrow].save()
          } else {
            await firstSheet.addRow(inscription)
          }
        })
        /*if (estEdition) {  
          rows.forEach((ligne) => {

          })    
          inscriptions.forEach(async (inscription) => {
            inscription.row.forEach((data, index) => {
              rows[inscription.nrow][titreColonnes[index].titre] = data
            })
            await rows[inscription.nrow].save()
          })
        } else {
          await firstSheet.addRows(inscriptions)
        } */
      } catch(erreur) {console.log('errur', erreur)}
      
    return {
      statusCode: 200,
      body: JSON.stringify({ data: "ok" }),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

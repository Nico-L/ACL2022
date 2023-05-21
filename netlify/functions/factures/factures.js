const apitemplate_token = process.env.APITEMPLATE_TOKEN
import fetch from 'node-fetch';

const handler = async function (event) {
  const dataFacture = event.queryStringParameters.dataFacture || null
  const nomFichier = event.queryStringParameters.nomFichier || "facture"
  let url = 'https://rest.apitemplate.io/v2/create-pdf?template_id=37c77b238f13a10c&export_type=json&expiration=5'
  if (nomFichier) {
    url = url + "&filename=" + nomFichier + ".pdf"
  }
  if (dataFacture) {
    var jsonFetch = { 
      method: "POST", 
      headers: { 'Content-Type': 'application/json', "X-API-KEY": apitemplate_token },
      body: dataFacture
    }
    const response = await fetch(url, jsonFetch)
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const retour = await response.json()
    return {
      statusCode: 200,
      body: JSON.stringify({ data: retour }),
    }
  }
}

module.exports = { handler }

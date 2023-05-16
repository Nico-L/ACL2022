const https = require('https');
const http = require('http');
const { URL } = require('url');
const apitemplate_token = process.env.APITEMPLATE_TOKEN

async function httpPost(url_api, data, apiKey){
    const uri = new URL(url_api);
    const fx = uri.protocol === 'https:' ? https : http;
    const opts = {
        method: 'POST',
        hostname: uri.hostname,
        port: uri.port,
        path: `${uri.pathname}${uri.search==null?"":uri.search}`,
        protocol: uri.protocol,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            "X-API-KEY": apiKey
        }
    };

    return new Promise((resolve, reject) => {
        const req = fx.request(opts, (res) => {
            res.setEncoding('utf8');
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => resolve(responseBody));
        });

        req.on('error', (err) => reject(err));
        req.write(data)
        req.end();
    });
}

const handler = async function (event) {
  const dataFacture = event.queryStringParameters.dataFacture || null
  const nomFichier = event.queryStringParameters.nomFichier || null
  let url = 'https://rest.apitemplate.io/v2/create-pdf?template_id=37c77b238f13a10c&export_type=json&expiration=5'
  if (nomFichier) {
    url = url + "&filename=" + nomFichier + ".pdf"
  }
  
  if (dataFacture) {
    // generation pdf
    let resp = await httpPost(
        url,
        dataFacture,
        apitemplate_token
    ); 
    return {
      statusCode: 200,
      body: JSON.stringify({ data: JSON.parse(resp) }),
    }
    /*if (resp.status !== "error") {
      const jsonFetch = { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization:"Token "+baserow_token }, 
        body: JSON.stringify({'url': resp.download_url})}
  

      try {
        const response = await fetch(baserowURL, jsonFetch)

        if (!response.ok) {
          return { statusCode: response.status, body: response.statusText }
        }
        const data = await response.json()

        return {
          statusCode: 200,
          body: JSON.stringify({ data: data }),
        }
      } catch (error) {
        // output to netlify function log
        console.log(error)
        return {
          statusCode: 500,
          // Could be a custom message or object i.e. JSON.stringify(err)
          body: JSON.stringify({ msg: error.message }),
        }
      }
    } */
  }
}

module.exports = { handler }

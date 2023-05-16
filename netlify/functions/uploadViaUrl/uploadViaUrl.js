import fetch from 'node-fetch';
const token = process.env.TOKEN_BASEROW_INSCRIPTIONS
const baserowURL = "https://baserow.luchier.fr/api/user-files/upload-via-url/"

const handler = async (event) => {
  var downloadUrl = event.queryStringParameters.downloadUrl || "https://acl-sappey.netlify.app/img/logos/mascottes.png"
  const expires = event.queryStringParameters.Expires || null
  const signature = event.queryStringParameters.Signature || null
  
  if (expires) {
    downloadUrl = downloadUrl + "&Expires="+expires
  }

  if (signature) {
    downloadUrl = downloadUrl + "&Signature="+encodeURIComponent(signature)
  }

  console.log('url finale', downloadUrl)

  const jsonFetch = { 
    method: "POST", 
    headers: { 'Content-Type': 'application/json', Authorization:"Token "+token }, 
    body: JSON.stringify({"url":downloadUrl})
  }
  
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
} 

module.exports = { handler }

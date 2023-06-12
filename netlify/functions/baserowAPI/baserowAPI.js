import fetch from 'node-fetch';
const token = process.env.TOKEN_BASEROW_INSCRIPTIONS
const baserowURL = "https://baserow.luchier.fr/api/database/rows/table/"

const handler = async function (event) {
  const type = event.queryStringParameters.type || "get"
  const finURL = JSON.parse(event.queryStringParameters.finURL) || null
  const body = event.queryStringParameters.body || null
  var jsonFetch = { method: type, headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization:"Token "+token }}
  if (type === "POST" || type === "PATCH") {
    jsonFetch.body = body
  }

  try {
    const response = await fetch(baserowURL + finURL.join("&"), jsonFetch)
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const data = type==="delete"? "delete ok":await response.json()

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

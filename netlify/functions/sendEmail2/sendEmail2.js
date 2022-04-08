 const handlebars = require('handlebars');
 const fs = require('fs');
 const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)

const fileName = "./netlify/functions/sendEmail2/template/confirmationEmail.hbs"
const mjmlTemplateFile = fs.readFileSync(fileName, 'utf8');
const template = handlebars.compile(mjmlTemplateFile);

const handler = async (event) => {

const dataEmail = JSON.parse(event.queryStringParameters.dataEmail) || null
const email = event.queryStringParameters.email || null
  try {
    var promises = []
if (email) {
const hbsHtml = template(dataEmail);
const request = mailjet.post('send', { version: 'v3.1' }).request({
  Messages: [
    {
      From: {
        Email: 'nicolas@luchier.fr',
        Name: 'ACL',
      },
      To: [
        {
          Email: 'nicolas@luchier.fr'
        },
      ],
      Subject: 'Votre inscription ACL',
      TextPart: 'Votre inscription ACL',
      HTMLPart: hbsHtml,
    },
  ],
})
promises.push(request)
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
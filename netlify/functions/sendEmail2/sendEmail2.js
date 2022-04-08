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

if (email) {
const hbsHtml = template(dataEmail);
const request = mailjet.post('send', { version: 'v3.1' }).request({
  Messages: [
    {
      From: {
        Email: 'nicolas@luchier.fr',
        Name: 'Me',
      },
      To: [
        {
          Email: 'nicolas@luchier.fr',
          Name: 'You',
        },
      ],
      Subject: 'Votre inscription ACL',
      TextPart: 'Votre inscription ACL',
      HTMLPart: hbsHtml,
    },
  ],
})
request
  .then(result => {
    console.log('success !')
    console.log(result.body)
  })
  .catch(err => {
    console.log('erreur :(')
    console.log(err.statusCode)
  })

}
    return {
        statusCode: 200,
        body: JSON.stringify({ retour: "ok"}),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    }
    
    module.exports = { handler }
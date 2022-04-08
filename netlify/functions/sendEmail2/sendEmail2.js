/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */

 //const sendgrid = require('@sendgrid/mail');
 const handlebars = require('handlebars');
 const fs = require('fs');
 const path = require('path')
 console.log('path',process.cwd());
 const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)

 //sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

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
      Subject: 'My first Mailjet Email!',
      TextPart: 'Greetings from Mailjet!',
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


    /*const dataEmail = JSON.parse(event.queryStringParameters.dataEmail) || null
    const email = event.queryStringParameters.email || null
    
    if (dataEmail) {
        hbsHtml = template(dataEmail);

        if(email)
        {
            console.log('bob ?')
            const msg = {
                to: email,
                from: {
                email: "nicolas@luchier.fr",
                name: "ACL"
                },
                subject: "Votre inscription à l'ACL",
                html: hbsHtml
            }
            
            sendgrid.send(msg).then(() => {
                console.log("ça marche ?");
            }, (error) => {
                console.log("erreur", error);    
            });
        }
    }*/
    return {
        statusCode: 200,
        body: JSON.stringify({ retour: "ok"}),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    }
    
    module.exports = { handler }
/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */

 const sendgrid = require('@sendgrid/mail');
 /*const handlebars = require('handlebars');
 const fs = require('fs');*/

 sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

/*
const fileName = "./netlify/functions/sendEmail/template/confirmationEmail.hbs"
const mjmlTemplateFile = fs.readFileSync(fileName, 'utf8');
const template = handlebars.compile(mjmlTemplateFile);
let hbsHtml; */


 const handler = async (event) => {

const msg = {
  to: 'nicolas@luchier.fr',
  from: 'nicolas@luchier.fr', // Use the email address or domain you verified above
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
console.log("message", msg)
//ES6
sendgrid
  .send(msg)
  .then(() => {console.log('hiop !')}, error => {
    console.log(error);

    if (error.response) {
      console.log(error.response.body)
    }
  });
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
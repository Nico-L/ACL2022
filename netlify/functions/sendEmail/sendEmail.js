/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */

 const sendgrid = require('@sendgrid/mail');
 const handlebars = require('handlebars');
 const fs = require('fs');

 sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const fileName = "/netlify/functions/sendEmail/template/confirmationEmail.hbs"
const mjmlTemplateFile = fs.readFileSync(fileName, 'utf8');
const template = handlebars.compile(mjmlTemplateFile);
let hbsHtml; 


 const handler = async (event) => {
try {
  // Message details
  const msg = {
                to: "nicolas@luchier.fr",
                from: {
                email: "nicolas@luchier.fr",
                name: "ACL"
                },
                subject: "Votre inscription à l'ACL",
                html: "bob ?"
            }

  // Try sending the message
  await sendgrid.send(msg);

  // Good, send response
  return {
   statusCode: 200,
   body: JSON.stringify({ message: "Email sent" })
  }
}
catch(err) {
  // Failed, log error
  console.log(err);

  // Return response
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "Email not sent" })
  }
}
 }
    module.exports = { handler }
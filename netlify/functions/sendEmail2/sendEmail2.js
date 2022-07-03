 const handlebars = require('handlebars');
 const fs = require('fs');
 const mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
)
const emailBureau = process.env.EMAIL_BUREAU_ACL

const fileName = {
  inscriptions: "./netlify/functions/sendEmail2/template/confirmationEmail.hbs",
  stage:"./netlify/functions/sendEmail2/template/confirmationStage.hbs"
}


const handler = async (event) => {
  const whichFile = event.queryStringParameters.whichFile || "inscriptions"
  const mjmlTemplateFile = fs.readFileSync(fileName[whichFile], 'utf8');
  const template = handlebars.compile(mjmlTemplateFile);

const dataEmail = JSON.parse(event.queryStringParameters.dataEmail) || null
const email = event.queryStringParameters.email || null
  try {
    var promises = []
    if (email && dataEmail) {
      const hbsHtml = template(dataEmail);
      let request
      switch (whichFile) {
        case "inscriptions":
        console.log('inscriptions', promises)
          request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
              {
                From: {
                  Email: emailBureau,
                  Name: 'ACL',
                },
                To: [
                  {
                    Email: email
                  },
                ],
                Subject: 'Votre inscription ACL',
                TextPart: 'Votre inscription ACL',
                HTMLPart: hbsHtml,
              },
            ],
          })
          break;
        case "stage":
        console.log('stage', promises)
          request = mailjet.post('send', { version: 'v3.1' }).request({
              Messages: [
                {
                  From: {
                    Email: emailBureau,
                    Name: 'ACL',
                  },
                  To: [
                    {
                      Email: email
                    },
                  ],
                  Subject: 'Votre inscription au stage ACL',
                  TextPart: 'Votre inscription au stage ACL',
                  HTMLPart: hbsHtml,
                },
              ],
            })
            break;
        default:
          console.log('rien')
      }
      promises.push(request)
    }
    console.log('les promises', promises)
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
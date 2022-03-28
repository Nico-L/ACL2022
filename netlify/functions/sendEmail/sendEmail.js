/**
 *
 * This call sends a message to the given recipient with vars and custom vars.
 *
 */

 const mailjet = require ('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET)

const variables = {
    adhesion: {titre: "adhésion sappeyarde familiale"},
    QF: "300",
    reduction: "-40%",
    inscrits: {
        prenom: "Bob",
        inscriptions: [
            {titre: "FM5", tarif: "200 €"},
            {titre: "Cours guitare", tarif:"300 €"}
        ]
    },
    reglement: "3 chèques",
    coutTotal: "500€"
}

 const handler = async (event) => {
     console.log('parti')
     const init = mailjet.post("send", {'version': 'v3.1'})
     console.log('init', init)
   const request = await init
    .request({
        "Messages":[
            {
                "From": {
                    "Email": "nicolas@luchier.fr",
                    "Name": "acl"
                },
                "To": [
                    {
                        "Email": "nicolas@luchier.fr",
                        "Name": "passenger 1"
                    }
                ],
                "TemplateID": 3812910,
                "TemplateLanguage": true,
                "Subject": "tst",
                "Variables": {
                    var: variables
                }
            }
        ]
    })
   console.log("request", request)
      return {
        statusCode: 200,
        body: JSON.stringify({ id: "bob ?"}),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    }
    
    module.exports = { handler }
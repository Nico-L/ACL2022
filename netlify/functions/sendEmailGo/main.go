package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	mailjet "github.com/mailjet/mailjet-apiv3-go"
	"log"
	"os"
)

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {
	fmt.Println("This message will show up in the CLI console.")

	mailjetClient := NewMailjetClient(os.Getenv("MAILJET_API_KEY"), os.Getenv("MAILJET_PRIVATE"))
	messagesInfo := []mailjet.InfoMessagesV31{
		mailjet.InfoMessagesV31{
			From: &mailjet.RecipientV31{
				Email: "pilot@mailjet.com",
				Name:  "Mailjet Pilot",
			},
			To: &mailjet.RecipientsV31{
				mailjet.RecipientV31{
					Email: "nicolas@luchier.fr",
					Name:  "passenger 1",
				},
			},
			Subject:  "Your email flight plan!",
			TextPart: "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
			HTMLPart: "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!",
		},
	}
	messages := mailjet.MessagesV31{Info: messagesInfo}
	res, err := m.SendMailV31(&messages)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Data: %+v\n", res)

	return &events.APIGatewayProxyResponse{
		StatusCode:      200,
		Headers:         map[string]string{"Content-Type": "text/plain"},
		Body:            "Hello, world!",
		IsBase64Encoded: false,
	}, nil
}

func main() {
	lambda.Start(handler)
}

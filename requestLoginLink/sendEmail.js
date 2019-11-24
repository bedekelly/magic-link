const AWS = require('aws-sdk');

exports.sendEmail = function sendEmail(recipient, subject, body, rawTextBody) {
  // Create sendEmail params
  const params = {
    Destination: { /* required */
      CcAddresses: [],
      ToAddresses: [recipient]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Charset: "UTF-8",
          Data: body
        },
        Text: {
          Charset: "UTF-8",
          Data: rawTextBody || "Sorry, this email requires HTML to view."
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: 'login@bede.io', /* required */
    ReplyToAddresses: [],
  };

  // Create the promise and SES service object
  AWS.config.update({region: 'eu-west-1'});
  return new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
}
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./sendEmail");
const { formatEmail } = require("./formatEmail");
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

const origin = "https://magic.bede.io"
const loginLinkURL =
  "https://vsf7qcdo1g.execute-api.eu-west-2.amazonaws.com/default/validateLoginLink";

exports.handler = async (event, context, callback) => {
  const done = (err, res) =>
    callback(null, {
      statusCode: err ? "400" : "200",
      body: err ? err.message : JSON.stringify(res),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin
      }
    });

  console.log(event.httpMethod);

  switch (event.httpMethod) {
    case "POST":
      const { email, redirect } = JSON.parse(event.body);
      try {
        // First, update the dynamo table with the provided email.
        const params = { TableName: "Accounts", Item: { email } };
        await dynamo.put(params).promise();

        // Next, generate a JWT authenticating this user for 30 mins.
        const plaintext = { redirect, email };
        const token = jwt.sign(plaintext, process.env.secret_key, {
          expiresIn: "30m"
        });

        // Send an email with a clickable link containing this JWT.
        const link = loginLinkURL + "?token=" + token;
        console.log("\n\n\n" + link + "\n\n\n");
        try {
          await sendEmail(email, "Login to magic.bede.io", formatEmail(link), link);
        } catch (e) {
          console.log(e);
          throw e;
        }

        done(null, {
          msg:
            "Added account if it didn't already exist; sent a login link via email."
        });
      } catch (e) {
        done(e);
      }
      break;
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};

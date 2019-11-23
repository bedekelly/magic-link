const AWS = require('aws-sdk');
const jwt = require("jsonwebtoken");
const dynamo = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


exports.handler = async (event, context, callback) => {
  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      'Allow-Control-Access-Origin': '*'
    },
  });

  console.log(event.httpMethod);
  const { email, redirect } = JSON.parse(event.body);

  switch (event.httpMethod) {
    case 'POST':
      try {
        // First, update the dynamo table with the provided email.
        const params = { TableName : "Accounts", Item: { email } };
        await dynamo.put(params).promise();

        // Next, generate a JWT authenticating this user for 30 mins.
        const plaintext = { redirect, email };
        const token = jwt.sign(plaintext, "abc", {expiresIn: "30m"});
        const verifiedPayload = jwt.verify(token, "abc");
        console.log({token, verifiedPayload});


        done(null, { msg: "Added account if it didn't already exist; sent a login link via email." })
      } catch(e) {
        done(e);
      }
      break;
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};

const doc = require('dynamodb-doc');
const jwt = require("jsonwebtoken");
const dynamo = new doc.DynamoDB();


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));

  const done = (err, res, hdrs) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      ...hdrs
    },
  });

  function redirectWithCookie(redirect, cookie) {
    console.log("Redirecting to", redirect);
    return callback(null, {
      statusCode: 307,
      body: 'Logging you in...',
      headers: {
        'Content-Type': 'text/html',
        'Location': redirect,
        'Set-Cookie': `login=${cookie}; SameSite=None; Secure`,

      }
    });
  }

  switch(event.httpMethod) {
    case "GET":
      // Retrieve and validate the JWT claiming an email account.
      const token = event.queryStringParameters.token;
      console.log(token);
      let valid;
      try {
        valid = jwt.verify(token, process.env.secret_key);
      } catch (e) {
        return done(e);
      }

      // Create a new JWT for the login session cookie.
      console.log(valid);
      const data = {
        email: valid.email,
      }
      const loginCookie = jwt.sign(data, process.env.secret_key, {expiresIn: "90 days"})
      redirectWithCookie(valid.redirect + `?email=${valid.email}`, loginCookie);
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};

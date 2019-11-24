const jwt = require("jsonwebtoken");
const origin = "https://magic.bede.io";


exports.handler = async (event, context) => {

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": true
      }
    };
  }

  // Retrieve the login token from the cookies.
  let verified;
  try {
    const loginJWT = event.headers.cookie
      .split(";")
      .map(pair => pair.split("="))
      .filter(([key, value]) => key === "login")
      .map(([, value]) => value)[0];
    console.log(loginJWT);
    verified = jwt.verify(loginJWT, process.env.secret_key);
  } catch (e) {
    console.log("e", e);
    return {
      statusCode: 401,
      body: JSON.stringify({msg:"Not logged in", reason: e, event: event, headers: event.headers}),
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true"
      }
    };
  }

  // Here, we know our user is authenticated.
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify({ email: verified.email, secret: "I'm secretly a nerd" }),
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true"
      }
    };
  } else {
    return {
      statusCode: 405,
      headers: {
        "Allow": "GET",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true"
      }
    };
  }
};

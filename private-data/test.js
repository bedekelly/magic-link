const jwt = require("jsonwebtoken");


exports.handler = async (event, context) => {

  // if (true) {
  //   return {
  //     statusCode: 200,
  //     body: JSON.stringify(event)
  //   }
  // }

  // Retrieve the login token from the cookies.
  let loginJWT;
  try {
    loginJWT = event.headers.cookie
      .split(";")
      .map(pair => pair.split("="))
      .filter(([key, value]) => key === "login")
      .map(([, value]) => value)[0];
  } catch (e) {
    return { statusCode: 401, body: JSON.stringify({msg:"Not logged in"}), headers: { "Set-Cookie": "" } };
  }

  // Validate the login token.
  let verified;
  try {
    verified = jwt.verify(loginJWT, process.env.secret_key);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 401,
      body: "Not authorized"
    };
  }

  // Here, we know our user is authenticated.
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200, body: JSON.stringify({ email: verified.email, secret: "I'm secretly a nerd" })
    };
  } else {
    return {
      statusCode: 405,
      headers: {
        "Allow": "GET"
      }
    };
  }
};

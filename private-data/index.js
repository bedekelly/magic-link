const jwt = require("jsonwebtoken");


exports.handler = async (event, context) => {
  // Retrieve the login token from the cookies.
  const loginJWT = event.cookie
    .split(";")
    .map(pair => pair.split("="))
    .filter(([key, value]) => key === "login")
    .map(([, value]) => value)[0];

  // Validate the login token.
  try {
    const { email } = jwt.verify(loginJWT, process.env.secret_key);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 401,
      body: "Not authorized"
    }
  }

  // Here, we know our user is authenticated.
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200, body: JSON.stringify({ secret: "I'm secretly a nerd" })
    }
  } else {
    return {
      statusCode: 405,
      headers: {
        "Allow": "GET"
      }
    }
  }
};

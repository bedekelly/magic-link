# magic-link
Log in with “Magic Links” a la Monzo, Slack etc.

This uses JWT for authorization and for login tokens. Currently there's no way to exploit this 
with cross-site scripting, since the requests are made using JSON meaning any modern browser will require 
preflight requests, and a single-site CORS policy will be enforced.

However, further security measures such as CSRF tokens should be considered should this be deployed in production.

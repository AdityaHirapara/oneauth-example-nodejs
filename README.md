# oneauth-example
A sample express app for oneauth (https://github.com/coding-blocks/oneauth)
Live Demo : https://oneauth-example-abhishek97.c9users.io/

# Installation

Requires node and npm installed.

1. `npm install`
2. `npm run request` to run Simple request version
3. `npm run passport` to run passport oauth version
4. Get `client_id` , `client_secret` from registering your client at https://account.codingblocks.com
5. Setup variable in `config.json` , if you are running on localhost, callback url must be `http://localhost:8080/callback`.
6. `node index.js`

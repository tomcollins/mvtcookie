mvtcookie
=====

#Usage
node app.js

Options:
--port=4001
--cookie_ttl=10000 //ms

Defaults:
port: 4001
cookie_ttl: 60000 //60 seconds

#URL

/ - text/html
/service.json - application/json

#Worst case
Infinite redirection loop.

const http = require("http");
const fs = require("fs");
const routes = require("./routes");

const server = http.createServer((req, res) => {

    const character = req.url.replace("/", "");
    if (req.url === "/") {
        routes.home(req, res);
    } else if (character && character.indexOf("/") < 0) { 
        routes.result(req, res);
    } else {
        routes.error(res);
    }
})

server.listen(4500);
const fs = require("node:fs");
const https = require("https");
const headData = fs.readFileSync("./templates/head.html", "utf-8");
const footerData = fs.readFileSync("./templates/footer.html", "utf-8");
const querystring = require("querystring");

const homeRoute = (request, response) => {
    const bodyData = fs.readFileSync("./templates/home.html", "utf-8");
    if (request.method.toUpperCase() === "GET") {
        response.writeHead(200, {"Content-type": "text/html"});
        //head
        response.write(headData);
        //body
        response.write(bodyData);
        //footer
        response.end(footerData);
    } else {
        request.on("data", (bodyData) => {
            const data = querystring.parse(bodyData.toString());
            console.log(data);
            response.writeHead(303, {"Location": "/" + data.character})
            response.end(footerData);
        })
    } 
}

const resultRoute = (request, response) => {
    let resultData = fs.readFileSync("./templates/result.html", "utf-8");
    let errorData = fs.readFileSync("./templates/error.html", "utf-8");

    response.writeHead(200, {"Content-type": "text/html"});
    //head
    response.write(headData);

    const ID = request.url.replace("/", "");
    if (ID === "favicon.ico") {
        return;
    }

    const API = `https://rickandmortyapi.com/api/character/${ID}`;

    https.get(API, (res) => {

        let characterData = "";
        res.on("data", function(data) {
            characterData += data.toString();
        })

        res.on("end", () => {
                const avatarData = JSON.parse(characterData);
                if (typeof avatarData.id === 'number') {
                    const templateData = {
                        id: avatarData.id,
                        name: avatarData.name,
                        status: avatarData.status,
                        gender: avatarData.gender,
                        origin: avatarData.origin.name,
                        species: avatarData.species,
                        location: avatarData.location.name,
                        image: avatarData.image
                    }
                    for (const prop in templateData) {
                        resultData = resultData.replace("{{" + prop + "}}", templateData[prop]);
                    }
                    response.write(resultData);
                } else {
                    // const errorMessage = avatarData.message;
                    errorData = errorData.replace("{{errorMessage}}", "character not found");
                    response.write(errorData);
                }
                response.end(footerData);
        })
    }).on("error", (error) => {
        errorData = errorData.replace("{{errorMessage}}", error);
        response.write(errorData);
        response.end(footerData);
    })
}

const errorRoute = (response) => {
    response.writeHead(200, {"Content-type": "text/html"});
    //head
    response.write(headData);
    response.write("<h1 class='red'>Error 404</h1>");
    response.write("<p class='red'>We couldn't find the page you're looking for.</p>");
    response.end(footerData);
}

module.exports = {home: homeRoute, result: resultRoute, error: errorRoute};
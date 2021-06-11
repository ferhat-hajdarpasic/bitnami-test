require("dotenv").config();
const requestModule = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const url = require("url");
const querystring = require("querystring");
const axios = require("axios");

let winston = require("winston");
const { createProxyMiddleware } = require("http-proxy-middleware");
let logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf((info) => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "test.log" }),
    ],
});

let app = express();
const API_SERVICE_URL = process.env.API_SERVICE_URL;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Function to handle the root path
app.get("/", async function (req, res) {
    logger.log("info", JSON.stringify(req.query));
    res.writeHead(200, { "Content-type": "text/plain" });
    res.end("Hello World");
});

app.use(
    "/michael",
    createProxyMiddleware({
        target: API_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            [`^/michael`]: "",
        },
    })
);

app.get("/liteman", async function (request, response) {
    logger.info("liteman", JSON.stringify(request.query));

    const messageName = 'message4';
    const username = 'fred.hajdarpasic@outlook.com';

    const url = `${process.env.API_SERVICE_URL}/Prod/MyResource?entityType=find_message_by_name&entityId=${messageName}&username=${username}`;
    requestModule.get(
        {
            uri: url,
        },
        function (err, res, body) {
            const parsedBody = JSON.parse(body);
            if (err) {
                response.status(res.statusCode).send({
                    err: err,
                    res: res,
                });
            } else {
                const frames = parsedBody.frames.map(f => {
                    // const grid = grid => grid.map(row => row.join('')).map(row.join('\n'))
                    const grid = g => g.map(row => row.join('')).join('\n');
                    const response = `${f.duration}\n${grid(f.grid)}`;
                    return response;
                    // return {
                    //     duration: f.duration,
                    //     index: f.index,
                    //     grid: grid(f.grid)
                    // }
                })
                const responseBody = frames.join('\n');
                response.status(res.statusCode).send(responseBody);
            }
        }
    );
});

app.post("/demo-old", function (request, response) {
    logger.log("info", request.body);
    const form = {
        cbkey: process.env.CBKEY,
        batch: `${request.body.device};${Math.floor(
            new Date().getTime() / 1000
        )};${request.body.data};${request.body.seqNumber}`,
    };
    const formData = querystring.stringify(form);
    const contentLength = formData.length;

    requestModule.post(
        {
            headers: {
                "Content-Length": contentLength,
                "Content-Type": "application/x-www-form-urlencoded",
                host: process.env.AIRTRACKER,
            },
            uri: process.env.AIRTRACKER_URL,
            body: formData,
        },
        function (err, res, body) {
            response.status(res.statusCode).send({
                err: err,
                res: res,
                body: body,
            });
        }
    );
});

const sendToAirTracker = async (device, data, seqNumber) => {
    const form = {
        cbkey: process.env.CBKEY,
        batch: `${device};${Math.floor(
            new Date().getTime() / 1000
        )};${data};${seqNumber}`,
    };
    const formData = querystring.stringify(form);
    const contentLength = formData.length;

    return await axios.post(process.env.AIRTRACKER_URL, formData, {
        headers: {
            "Content-Length": contentLength,
            "Content-Type": "application/x-www-form-urlencoded",
            host: process.env.AIRTRACKER,
        },
    });
};

app.post("/demo", async function (request, response) {
    logger.log(
        "info",
        `Sending data for unit: ${request.body.device}, data=${request.body.data}`
    );
    try {
        let remoteResponse = await sendToAirTracker(
            request.body.device,
            request.body.data,
            request.body.seqNumber
        );
        logger.log("info", remoteResponse.statusText);
        if (request.body.temperatureData) {
            logger.log(
                "info",
                `Sending temperature data for unit: ${request.body.device}, data=${request.body.temperatureData}`
            );
            remoteResponse = await sendToAirTracker(
                request.body.device,
                request.body.temperatureData,
                request.body.seqNumber
            );
            logger.log("info", remoteResponse.statusText);
        }
        if (request.body.data2) {
            logger.log(
                "info",
                `Sending data2 for unit: ${request.body.device}, data=${request.body.data2}`
            );
            remoteResponse = await sendToAirTracker(
                request.body.device,
                request.body.data2,
                request.body.seqNumber
            );
            logger.log("info", remoteResponse.statusText);
        }
        if (request.body.data3) {
            logger.log(
                "info",
                `Sending data3 for unit: ${request.body.device}, data=${request.body.data3}`
            );
            remoteResponse = await sendToAirTracker(
                request.body.device,
                request.body.data3,
                request.body.seqNumber
            );
            logger.log("info", remoteResponse.statusText);
        }
        response.status(remoteResponse.status).send(remoteResponse.headers);
    } catch (e) {
        logger.log("error", e);
        response.status(500).send(e);
    }
});

const port = 8080;
let server = app.listen(port, function () {
    logger.log("info", `Server is listening on port ${port}`);
});

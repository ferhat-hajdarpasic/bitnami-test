require('dotenv').config();
const requestModule = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const url = require('url');
const querystring = require('querystring');

let winston = require('winston');
const { createProxyMiddleware } = require('http-proxy-middleware');
let logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'test.log' })
    ]
});

let app = express();
const API_SERVICE_URL = process.env.API_SERVICE_URL;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Function to handle the root path
app.get('/', async function (req, res) {
    logger.log('info', JSON.stringify(req.query));
    res.writeHead(200, { 'Content-type': 'text/plain' });
    res.end('Hello World');
});

app.use('/michael', createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/michael`]: '',
    }
}));

app.post('/demo', function (request, response) {
    logger.log('info', request.body);
    const form = {
        cbkey: process.env.CBKEY,
        batch: `${request.body.device};${Math.floor(new Date().getTime() / 1000)};${request.body.data};${request.body.seqNumber}`
    };
    const formData = querystring.stringify(form);
    const contentLength = formData.length;

    requestModule.post({
        headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'host': process.env.AIRTRACKER
        },
        uri: process.env.AIRTRACKER_URL,
        body: formData
    }, function (err, res, body) {
        response.status(res.statusCode).send({
            err: err,
            res: res,
            body: body
        });
    });
});

let server = app.listen(8080, function () {
    logger.log('info', 'Server is listening on port 8080')
});
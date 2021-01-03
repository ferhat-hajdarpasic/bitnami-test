require('dotenv').config();
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
        new winston.transports.File({filename: 'test.log'})
    ]
});

let app = express();
const API_SERVICE_URL = process.env.API_SERVICE_URL;  
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

// Function to handle the root path
app.get('/', async function(req, res) {
    logger.log('info', JSON.stringify(req.query));
    res.writeHead(200, {'Content-type':'text/plain'});
    res.end('Hello World');
});

app.use('/michael', createProxyMiddleware({
   target: API_SERVICE_URL,
   changeOrigin: true,
   pathRewrite: {
       [`^/michael`]: '',
   }
}));

app.post('/demo', function(request, response){
    logger.log('info', request.body);
    response.send({
        device: request.body.device,
        time: request.body.time,
        data: request.body.data,
        seqNumber: request.body.seqNumber
    });
  });

let server = app.listen(8080, function() {  
    logger.log('info', 'Server is listening on port 8080')
});
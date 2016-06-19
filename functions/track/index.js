// https://mixpanel.com/help/reference/http

const AWS = require('aws-sdk');

const Firehose = new AWS.Firehose();

const SUCCESS = 1;
const ERROR   = 0;

// {
//     "data": "eyJldmVudCI6ICJnYW1lIiwgInByb3BlcnRpZXMiOiB7ImlwIjogIjEyMy4xMjMuMTIzLjEyMyIsICJkaXN0aW5jdF9pZCI6IDEzNzkzLCAidG9rZW4iOiAiZTNiYjQxMDAzMzBjMzU3MjI3NDBmYjhjNmY1YWJkZGMiLCAidGltZSI6IDEyNDU2MTM4ODUsICJhY3Rpb24iOiAicGxheSJ9fQ==",
//     "ip": "127.0.0.1",
//     "redirect": "",
//     "callback": "",
//     "img": false,
//     "verbose": false
// }
exports.handle = function handle(event, context, callback) {
    const ip = event.ip || "127.0.0.1";
    
    // Not implemented
    const redirect = event.redirect || "";
    const verbose = event.verbose || false;
    
    console.log({ip, redirect, verbose});
    
    if (event.callback) {
        callback(null, output(verbose, ERROR, "callback, jsonp not supported in this implementation"));
        return;
    }
    
    if (event.img) {
        callback(null, output(verbose, ERROR, "img, img is not supported in this implementation"));
        return;
    }
    
    if (!event.data) {
        callback(null, output(verbose, ERROR, "data, missing or empty"));
        return;
    }
    
    try {
        const data = JSON.parse(new Buffer(event.data, "base64").toString("utf8"));
    } catch (e) {
        callback(null, output(verbose, ERROR, "data, invalid base64 encoding"));
        return;
    }
    
    var params = {
        DeliveryStreamName: process.env.DELIVERY_STREAM_NAME,
        Record: {
            Data: JSON.stringify(data)
        }
    };
    
    Firehose.putRecord(params, (err, _data) => {
        if (err) {
            console.error(err);
            callback(null, output(verbose, ERROR, "firehose, could not send data to firehose"));
        } else {
            callback(null, output(verbose, SUCCESS, null));
        }
    });
};

function output(verbose, status, error) {
    if (verbose) {
        return { status, error };
    }
    
    return status;
}
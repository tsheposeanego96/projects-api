'use strict';

const AWS = require('aws-sdk');

AWS.config.update({ region: 'eu-west-1' });

const getResponseHeaders = (origin, stage) => {

    console.log(`origin = ${origin} - stage: ${stage}`);
    const ALLOWED_ORIGINS = [
    ];

    if (stage === 'dev') {
        ALLOWED_ORIGINS.push('http://localhost:4200');
    }

    let allowedOrigin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        allowedOrigin = origin;
        console.log('==Allowed origin==', allowedOrigin);
    }
    return {
        'Access-Control-Allow-Origin': allowedOrigin ? allowedOrigin : 'http://localhost:4200'
    }
}

module.exports = {
    getResponseHeaders,
}
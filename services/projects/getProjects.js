"use strict";
/**
 * Route: GET /blog/users
 */


const AWS = require('aws-sdk');
const { getResponseHeaders } = require('./util.js');

AWS.config.update({ region: 'eu-west-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PROJECTS_TABLE;


exports.handler = async (event) => {
    try {
        let queryParams = event.queryStringParameters;

        let expressionNames = { "#t": "type" };
        let expressionValues = { ":project": "PROJECT" };

        let keyConditionExpression = "#t = :project ";

        let filterExpression = undefined;
        let indexName = "type-sk-index";



        let params = {
            TableName: tableName,
            IndexName: indexName,
            FilterExpression: filterExpression,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeNames: expressionNames,
            ExpressionAttributeValues: expressionValues
        };

        if (queryParams && queryParams.limit) {
            params.Limit = queryParams.limit; 
        }

        let lastEvaluatedKey = queryParams && queryParams.lastEvaluatedKey ? queryParams.lastEvaluatedKey : null;

        if (lastEvaluatedKey) {
            lastEvaluatedKey = JSON.parse(lastEvaluatedKey);
            params.ExclusiveStartKey = (lastEvaluatedKey);
        }

        let forms = await dynamodb.query(params).promise();
        forms = getFormattedData(forms);
        return {
            statusCode: 200,
            headers: getResponseHeaders(event.headers.origin, event.requestContext.stage),
            body: JSON.stringify(forms)
        };
    } catch (err) {

        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: getResponseHeaders(event.headers.origin, event.requestContext.stage),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}


function getFormattedData(data) {
    let projects = [];
    data.Items.forEach(async (item) => {
        projects.push({
            id: parseInt(item.pk.replace('PROJECT#', '')),
            name: item.sk,
            image: item.image,
            groups: item.groups,
            url: item.url,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        });
    });

    return {
        projects: projects,
        count: data.Count,
    }
}

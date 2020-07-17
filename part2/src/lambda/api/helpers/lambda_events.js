'use strict';
class LambdaEvents
{
    static API_GATEWAY__PROXY(event)
    {
        return {
                    HttpMethod: event.httpMethod,
                    Path: event.path,
                    Stage: event.stage,
                    AwsApiKey: null, //event.headers["x-api-key"] || null,
                    Authorization: event.headers["Authorization"] || null,
                    QueryString: event.queryStringParameters || null,
                    Body: event.body || null,
                    IsBase64Encoded: event.isBase64Encoded,
                    CognitoUser: (event.requestContext.authorizer ?  event.requestContext.authorizer.claims : null)
                };
    }

}
module.exports = LambdaEvents;

'use strict';

class LambdaResponse
{
    static API_GATEWAY(responseCode, data, extraControl = {}, statusCode = 200, fullCorsEnabled = true)
    {
        let ret =  {
                        statusCode: statusCode,
                        headers: { },
                        body: JSON.stringify({
                            "control": { "ResponseCode": responseCode, ...extraControl},
                            "data": data,
                        }),
                    };

        if(fullCorsEnabled)
        {
            ret.headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            };
        }

        return ret;
    }
}

module.exports = LambdaResponse;
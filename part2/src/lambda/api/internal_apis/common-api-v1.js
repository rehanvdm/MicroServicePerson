const axios = require('axios');
const Xray = require('../helpers/xray');
const LambdaLog = require('../helpers/lambda_log');
const logger = new LambdaLog();

class CommonApiV1
{
    constructor(awsXray, apiUrl)
    {
        this.awsXray = awsXray;
        this.xray = new Xray(awsXray);
        this.apiUrl = apiUrl;
        this.version = "/v1";

        this.xraySegmentName = "API::MicroServiceCommon/prod"+this.version
    }

    async apiRequest(method, resourcePath, body, queryParams = null,  headers = {}, timeout = 20000)
    {
        var options = {
            method: method,
            data: body,
            params: queryParams,
            url:  this.apiUrl+resourcePath,
            timeout: timeout,
            headers: Object.assign(headers, {
                "micro-service-trace-id":  logger.getTraceId()
            }),
            transformResponse: (res) => { return res; } /* Do not parse json */
        };

        let resp = await axios(options); /* Let this error, aka anything non 200 will throw error, bubble up */
        return resp.data;
    }

    async process_person_created(clientId, personName)
    {
        let body = {
            control: {},
            data: {
                client_id: clientId,
                name: personName
            },
        };

        return await this.xray.AsyncSegment(this.xraySegmentName,"process/person_created",
            this.apiRequest("POST", this.version+"/process/person_created", body)
                .then(resp =>
                {
                    let retBody = JSON.parse(resp);
                    if(retBody.control.ResponseCode !== 2000)
                        throw new Error("CommonApiV1.process_person_created :: "+resp);

                    return retBody.data;
                })
            ,{"client_id": clientId});
    }


}

module.exports = CommonApiV1;

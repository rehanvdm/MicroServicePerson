'use strict';
// const aws = require('aws-sdk');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const path = require('path');
const util = require('util');


const TEST_AGAINST__DEVELOPMENT = "DEVELOPMENT";
const TEST_AGAINST__LOCAL = "LOCAL";
const TEST_AGAINST__DEPLOYED = "DEPLOYED";

class Context
{
    constructor(memSzie, timeOutSeconds)
    {
        this.memoryLimitInMB = memSzie;
        this.awsRequestId = uuidv4();

        this.__timeStart = (new Date()).getTime();
        this.__timeOut = timeOutSeconds*1000;
    }
    getRemainingTimeInMillis()
    {
        let timeNow = (new Date()).getTime();
        let timeElapsed = timeNow - this.__timeStart;
        return this.__timeOut - timeElapsed;
    };
}

class Helper
{
    constructor()
    {
        process.argv.forEach((value, index) =>
        {
            if(value.indexOf('--TEST=development') !== -1)
                this.TestAgainst = TEST_AGAINST__DEVELOPMENT;
            else if(value.indexOf('--TEST=local') !== -1)
                this.TestAgainst = TEST_AGAINST__LOCAL;
            else if(value.indexOf('--TEST=deployed') !== -1)
                this.TestAgainst = TEST_AGAINST__DEPLOYED;
        });

        if(typeof this.TestAgainst == 'undefined') //If not paassed in
            this.TestAgainst = TEST_AGAINST__DEVELOPMENT;

        console.log("LAMBDA HELPER -> TestAgainst = " + this.TestAgainst);
    }
    
    async API_Post(url, resourcePath, body, apiKey = null, cognitoIdToken = null)
    {
        var options = {
            method: 'post',
            data: body,
            url: url+resourcePath,
            timeout: 30000,
            headers: {
            }
        };

        if(apiKey)
            options.headers["x-api-key"] = apiKey;

        if(cognitoIdToken)
            options.headers["Authorization"] = cognitoIdToken;


        let res = await axios(options);
        return {
            'statusCode': res.status,
            'body': JSON.stringify(res.data)
        };
    }

    LambdaContext(memSzie, timeOut)
    {
        var context = new Context(memSzie, timeOut);
        return context;
    }



    SetAWSSDKCreds(profileName, region)
    {
        process.env.AWS_PROFILE = profileName;
        process.env.AWS_DEFAULT_REGION  = region;
    }

    /**
     *
     * @param absolutePath
     * @param fileName ending in .js
     * @constructor
     */
    RequireLambdaFunction(absolutePath, fileName)
    {
        /* Change the node_modules path to use that lambda functions modules and not the test folders */
        process.env.NODE_PATH = absolutePath+"/node_modules";
        require("module").Module._initPaths();
        return require(absolutePath + "/" +fileName);
    }

    /* Setting Environment variables for Lambda here when Testing Dev only */
    async SetEnvironmentVariables(environment, version, build, timeOut, enableChaos, injectError, injectLatency,
                                    dynamoTable, apiCommonUrl)
    {
        /* Read these from a file */
        process.env.ENVIRONMENT =  environment;
        process.env.VERSION = version;
        process.env.BUILD = build;
        process.env.TIMEOUT = timeOut;
        process.env.ENABLE_CHAOS = enableChaos;
        process.env.INJECT_ERROR = injectError;
        process.env.INJECT_LATENCY = injectLatency;

        process.env.DYNAMO_TABLE = dynamoTable;
        process.env.API_COMMON_URL = apiCommonUrl;

        process.env.AWS_XRAY_CONTEXT_MISSING = "LOG_ERROR"; /* If we don't have the X-Ray client installed when testing locally. */
        process.env.AWS_XRAY_LOG_LEVEL  = "silent"; /* Silent all logs/errors coming from X-Ray when testing locally */
    }
}

Helper.API_URL = "https://f08d33qq98.execute-api.us-east-1.amazonaws.com/prod";
Helper.DYNAMO_TABLE = "MicroServicePerson-table";
Helper.API_COMMON_URL = "https://2ce8m8h7ia.execute-api.us-east-1.amazonaws.com/prod";

Helper.AWS_PROFILE_MAME = "rehan-demo";
Helper.AWS_PROFILE_REGION = "us-east-1";

Helper.TEST_AGAINST__DEVELOPMENT = TEST_AGAINST__DEVELOPMENT;
Helper.TEST_AGAINST__LOCAL = TEST_AGAINST__LOCAL;
Helper.TEST_AGAINST__DEPLOYED = TEST_AGAINST__DEPLOYED;


module.exports = Helper;



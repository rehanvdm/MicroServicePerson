'use strict';
const chai = require('chai');
const expect = chai.expect;

var resolve = require('path').resolve;
const Helper = require('../../../_helpers/lambda_app.js');
const Events = require('../../../_events/events.js');
var events = new Events();
var helper = new Helper();

let TimeOut = 30;

// helper.TestAgainst = Helper.TEST_AGAINST__DEPLOYED;

describe('Test Person - Positive', function ()
{
    beforeEach(async function()
    {
        await helper.SetEnvironmentVariables("prod", "1.0.0", "1", "25",
                                            "false", "error", "5000",
                                             Helper.DYNAMO_TABLE, Helper.API_COMMON_URL);

        helper.SetAWSSDKCreds(Helper.AWS_PROFILE_MAME, Helper.AWS_PROFILE_REGION);
    });

    it('Created person', async function()
    {
        let result;

        let body = {
            "control": { },
            "data": {
                "client_id": "f2710c82-4d7b-442d-91fd-cde5c8dd4c94",
                "name": "Rehan",
                "email": "rehan123456@gmail.com"
            }
        };

        let resourcePath = '/v1/person/create';

        console.log("Testing against:", Helper.TEST_AGAINST__DEPLOYED);
        if(helper.TestAgainst === Helper.TEST_AGAINST__DEVELOPMENT)
        {
            this.timeout(TimeOut*1000);

            let event = events.API_GATEWAY_HTTP_PROXY_POST(resourcePath,body, null, null,null);

            let app = helper.RequireLambdaFunction(resolve('../src/lambda/api/'), 'app.js');
            result = await app.handler(event, helper.LambdaContext(128, TimeOut));
        }
        else if(helper.TestAgainst === Helper.TEST_AGAINST__DEPLOYED) /* Do specific API Call against AWS Resources after deployment */
        {
            this.timeout(TimeOut*1000);

            result = await helper.API_Post(Helper.API_URL, resourcePath, body, null, null,);
        }

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.control.ResponseCode).to.be.equal(2000);

        expect(response.data.client_id).to.equal(body.data.client_id);
        expect(response.data.person_id).to.be.an("string");
        expect(response.data.name).to.be.equal(body.data.name);
        expect(response.data.email).to.be.equal(body.data.email);
        expect(response.data.created_at).to.be.an("string");
    });

    it('Find first 100', async function()
    {
        let result;

        let body = {
            "control": { },
            "data": {
                "limit": "100"
            }
        };

        let resourcePath = '/v1/person/find_first';

        console.log("Testing against:", Helper.TEST_AGAINST__DEPLOYED);
        if(helper.TestAgainst === Helper.TEST_AGAINST__DEVELOPMENT)
        {
            this.timeout(TimeOut*1000);

            let event = events.API_GATEWAY_HTTP_PROXY_POST(resourcePath,body, null, null,null);

            let app = helper.RequireLambdaFunction(resolve('../src/lambda/api/'), 'app.js');
            result = await app.handler(event, helper.LambdaContext(128, TimeOut));
        }
        else if(helper.TestAgainst === Helper.TEST_AGAINST__DEPLOYED) /* Do specific API Call against AWS Resources after deployment */
        {
            this.timeout(TimeOut*1000);

            result = await helper.API_Post(Helper.API_URL, resourcePath, body, null, null,);
        }

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.control.ResponseCode).to.be.equal(2000);

        expect(response.data.Items).to.be.an("array");
        expect(response.data.Items[0].person_id).to.be.an("string");
        expect(response.data.Items[0].client_id).to.be.an("string");
        expect(response.data.Items[0].name).to.be.an("string");
        expect(response.data.Items[0].email).to.be.an("string");
        expect(response.data.Items[0].created_at).to.be.an("string");
    });
});

describe('Test Person - Negative', function ()
{
    beforeEach(async function()
    {
        await helper.SetEnvironmentVariables("prod", "1.0.0", "1", "25",
            "false", "error", "5000",
            Helper.DYNAMO_TABLE);

        helper.SetAWSSDKCreds(Helper.AWS_PROFILE_MAME, Helper.AWS_PROFILE_REGION);
    });

    it('Created person - name missing', async function()
    {
        let result;

        let body = {
            "control": { },
            "data": {
                "client_id": "XXX",
                // "name": "Rehan",
                "email": "rehan123456@gmail.com"
            }
        };

        let resourcePath = '/v1/person/create';

        console.log("Testing against:", Helper.TEST_AGAINST__DEPLOYED);
        if(helper.TestAgainst === Helper.TEST_AGAINST__DEVELOPMENT)
        {
            this.timeout(TimeOut*1000);

            let event = events.API_GATEWAY_HTTP_PROXY_POST(resourcePath,body, null, null,null);

            let app = helper.RequireLambdaFunction(resolve('../src/lambda/api/'), 'app.js');
            result = await app.handler(event, helper.LambdaContext(128, TimeOut));
        }
        else if(helper.TestAgainst === Helper.TEST_AGAINST__DEPLOYED) /* Do specific API Call against AWS Resources after deployment */
        {
            this.timeout(TimeOut*1000);

            result = await helper.API_Post(Helper.API_URL, resourcePath, body, null, null,);
        }

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.control.ResponseCode).to.be.equal(5002);
        expect(response.data).to.be.equal("Field: name is required and can not be longer than 50 characters");
    });

    it('Find first 100 - Limit > 100', async function()
    {
        let result;

        let body = {
            "control": { },
            "data": {
                "limit": "101"
            }
        };

        let resourcePath = '/v1/person/find_first';

        console.log("Testing against:", Helper.TEST_AGAINST__DEPLOYED);
        if(helper.TestAgainst === Helper.TEST_AGAINST__DEVELOPMENT)
        {
            this.timeout(TimeOut*1000);

            let event = events.API_GATEWAY_HTTP_PROXY_POST(resourcePath,body, null, null,null);

            let app = helper.RequireLambdaFunction(resolve('../src/lambda/api/'), 'app.js');
            result = await app.handler(event, helper.LambdaContext(128, TimeOut));
        }
        else if(helper.TestAgainst === Helper.TEST_AGAINST__DEPLOYED) /* Do specific API Call against AWS Resources after deployment */
        {
            this.timeout(TimeOut*1000);

            result = await helper.API_Post(Helper.API_URL, resourcePath, body, null, null,);
        }

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.control.ResponseCode).to.be.equal(5002);
        expect(response.data).to.be.equal("Field: limit is required and can not be more than 100");
    });
});


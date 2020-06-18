const LambdaEvents = require('./helpers/lambda_events');
const LambdaResponse = require('./helpers/lambda_response');
const LambdaLog = require('./helpers/lambda_log');
const LambdaError = require('./helpers/lambda_errors');

const moment = require('moment');
const awsXray = require('aws-xray-sdk-core');
const aws =  awsXray.captureAWS(require('aws-sdk'));
/* Do not capture these, we will annotate them ourselves */
// awsXray.captureHTTPsGlobal(require('http'));
// awsXray.captureHTTPsGlobal(require('https'));
aws.config.region = 'us-east-1';

const audit_log = require('./data_schema/audit_log');

const logger = new LambdaLog();
logger.init(process.env.ENVIRONMENT);


exports.handler = async (event, context) =>
{
    let ret = false;
    logger.setTraceId(context.awsRequestId);
    logger.log("Init",process.env.ENVIRONMENT, process.env.VERSION, process.env.BUILD);

    let response = null;
    let apiClass;

    let auditRecord = new audit_log(audit_log.GetNewID(), logger.getTraceId(), null,
        null, null, null, null,
        null, "api", "MicroServicePerson::api", null,
        null, moment().utc().format("YYYY-MM-DD HH:mm:ss.SSS"),
        process.env.ENVIRONMENT, process.env.VERSION, process.env.BUILD);

    try
    {
        let request = LambdaEvents.API_GATEWAY__PROXY(event);
        // if( process.env.ENVIRONMENT === "prod") /* Log anonymized info */
        //     logger.log("Request", { HttpMethod: request.HttpMethod, Path: request.Path, Authorization: request.Authorization, QueryString: request.QueryString });
        // else
        logger.log("Request", request);

        if(request.HttpMethod !== "POST")
            throw new LambdaError.HandledError("GET is not supported, please POST");

        try { request.Body = JSON.parse(request.Body); } catch (e) { request.Body = null; }

        if(!request.Body || typeof request.Body !== 'object')
            throw new LambdaError.HandledError("POST Body is not valid JSON");
        else if(!request.Body.control)
            throw new LambdaError.HandledError("API control object not specified in post body (control)");

        request.Body.control = request.Body.control || null;

        /* Remove trailing slash if have from /v1/ping/pong */
        if(request.Path.endsWith('/'))
            request.Path = request.Path.substring(0,request.Path.length-1);

        let requestResourceParts = request.Path.split('/', 4);
        let version = requestResourceParts[1] || null;      //  v1
        let reqType = requestResourceParts[2] || null;      //  ping
        let reqAction = requestResourceParts[3] || null;    //  pong


        let authUser = null;

        /* Here you would get the Cognito user from the request.CognitoUser and use some of those properties
         *  but for the sake of simplicity the caller is just passing that along for demonstration */
        if(request.Body.control.user_id)
        {
            let authUser = { user_id: request.Body.control.user_id };
            logger.info("authUser", authUser);
            if(awsXray.getSegment())
                awsXray.getSegment().setUser(auditRecord.user_id);
        }

        auditRecord.origin_path = request.Path;
        auditRecord.meta = request.HttpMethod;


        /* Create an instance of the class dynamically, ex: ./v1/link.js, since we whitelisted the functions
         * above so just assume that it is there and that we can execute it */
        apiClass = new (require('./'+version+'/'+reqType+'.js'))(aws, awsXray);
        let reqResp = await apiClass[reqAction](authUser, request.Body);

        reqResp.control = Object.assign(reqResp.control ? reqResp.control : {}, {"TraceID": logger.getTraceId()});

        auditRecord.status = true;
        auditRecord.status_code = 2000;
        response = LambdaResponse.API_GATEWAY(auditRecord.status_code, reqResp.body, reqResp.control);

        /* IF the call wants to customize the values stored for audit log
           Explicitly assign fields to main_audit_record that got from response */
        if(reqResp.auditRecord)
        {
            if(reqResp.auditRecord.meta)
                auditRecord.meta = reqResp.meta;

            if(reqResp.auditRecord.client_id)
                auditRecord.client_id = reqResp.client_id;
        }
    }
    catch (err)
    {
        // console.error(err);
        logger.error(err);

        auditRecord.status = false;
        auditRecord.raise_alarm = true; /* Later do sampling */
        auditRecord.status_description = err.message;

        let extraControl = { "TraceID": logger.getTraceId() };

        if(err instanceof LambdaError.HandledError)
        {
            auditRecord.status_code = 5001;
            response = LambdaResponse.API_GATEWAY(auditRecord.status_code, auditRecord.status_description, extraControl);
        }
        else if(err instanceof LambdaError.ValidationError)
        {
            auditRecord.status_code = 5002;
            response = LambdaResponse.API_GATEWAY(auditRecord.status_code, auditRecord.status_description, extraControl);
        }
        else if(err instanceof LambdaError.AuthError)
        {
            auditRecord.status_code = 3001;
            response = LambdaResponse.API_GATEWAY(auditRecord.status_code, auditRecord.status_description, extraControl);
        }
        else
        {
            auditRecord.status_code = 5000;
            response = LambdaResponse.API_GATEWAY(auditRecord.status_code, "Unexpected Error Occurred", extraControl); /* Not a safe error to return to caller */
        }
    }
    finally
    {
        auditRecord.run_time = ((process.env.TIMEOUT*1000) -  context.getRemainingTimeInMillis());
        logger.audit(true, auditRecord);
    }

    logger.info(response);
    return response;
}

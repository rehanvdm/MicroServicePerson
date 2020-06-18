class ApiBaseClass
{

    constructor(aws_sdk, awsXray)
    {

    }

    /**
     *
     * @param body
     * @param control
     * @param auditRecord {audit_log|null}
     * @returns {{lambdaResponse: *, auditRecord: audit_log}}
     * @constructor
     */
    MethodReturn(body, control = null, auditRecord = null)
    {
        return { body, control, auditRecord };
    }
}

module.exports = ApiBaseClass;

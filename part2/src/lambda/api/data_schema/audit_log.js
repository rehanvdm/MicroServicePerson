const { v4: uuidv4 } = require('uuid');

class audit_log
{
    /**
     *
     * @param audit_log_uuid
     * @param trace_id
     * @param client_id
     * @param user_id
     * @param status true || false
     * @param status_code  200 || 508 || 301 ...
     * @param status_description Success || Validation Error || Handled Error
     * @param raise_alarm true || false Not used now, later implementation for sampling if error
     * @param type api || sqs-consumer || cognito
     * @param origin <project/repo name::lambda dir> MicroServicePerson::api
     * @param origin_path Arguments/flow of that lambda. If API specify path: /v1/session
     * @param meta Can specify the method here if want, unstructured won't be used to over arching search
     * @param created_at
     * @param run_time
     * @param environment
     * @param app_version
     * @param app_build
     */
    constructor(audit_log_uuid, trace_id, client_id, user_id, status, status_code, status_description, raise_alarm, type, origin, origin_path, meta,
                created_at, run_time, environment, app_version, app_build)
    {
        this.audit_log_uuid = audit_log_uuid;
        this.trace_id = trace_id;
        this.client_id = client_id;
        this.user_id = user_id;

        this.status = status;
        this.status_code = status_code;
        this.status_description = status_description;
        this.raise_alarm = raise_alarm;

        this.type = type;
        this.origin = origin;
        this.origin_path = origin_path;
        this.meta = meta;

        this.created_at = created_at;
        this.run_time = run_time;

        this.environment = environment;
        this.app_version = app_version;
        this.app_build = app_build;
    }

    static FromObject(obj)
    {
        return Object.assign(new audit_log(), obj);
    }

    Sanitize()
    {
        let cpyThis = Object.assign({}, this);
        return cpyThis;
    }

    static GetNewID()
    {
        return audit_log.ID_PreFix+uuidv4();
    }
}
audit_log.ID_PreFix = "aul_";

module.exports = audit_log;


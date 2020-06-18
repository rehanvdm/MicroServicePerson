'use strict';

function log(level, env, msg, args, traceId, errorObj)
{
    let date = new Date();
    let line = { date: date, level: level, env: env, msg: msg, args: args, traceId: traceId };
    console.log(JSON.stringify(line));

    /* Want to preserver error obj and stack trace, if have full error, no need to log that */
    if(errorObj)
        line.error = errorObj;

    return line;
}

function CatchProcessErrors(err)
{
    LambdaLog.instance.uncaughtError(err);
    //process.exit(1); /* Can exit process now, no need to keep a dead thing around and wait */
}

class LambdaLog
{
    constructor()
    {
        if(LambdaLog.instance)
            return LambdaLog.instance;

        /* Add global error handlers here */
        process.on('uncaughtException', CatchProcessErrors);
        process.on('unhandledRejection', CatchProcessErrors);
    }

    init(env, onLogged = null)
    {
        this.env = env;
        this.onLogged = onLogged;
        this.trace_id = null;
        LambdaLog.instance = this;
    }

    setTraceId(traceId)
    {
        this.trace_id = traceId;
    }
    getTraceId()
    {
        return this.trace_id;
    }

    debug(message, ...optionalParams)
    {
        let line = log("debug", this.env, message, optionalParams, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line);
    };

    log(message, ...optionalParams)
    {
        let line = log("log", this.env, message, optionalParams, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line);
    };

    info(message, ...optionalParams)
    {
        let line = log("info", this.env, message, optionalParams, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line);
    };

    audit(success, auditObject)
    {
        let line = log("audit", this.env, success? "SUCCESS":"ERROR", auditObject, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line);
    };

    error(message, ...optionalParams)
    {
        let line;
        if(message instanceof  Error)
            line = log("error", this.env, message.message, message.stack.toString(), this.trace_id, message);
        else
            line = log("error", this.env, message, optionalParams, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line);
    };

    uncaughtError(message, ...optionalParams)
    {
        let line;
        if(message instanceof  Error)
            line = log("error", this.env, message.message, message.stack.toString(), this.trace_id, message);
        else
            line = log("error", this.env, message, optionalParams, this.trace_id);

        if(this.onLogged !== null)
            this.onLogged(line, true);
    };
}

/**
 *
 * @type LambdaLog
 */
LambdaLog.instance = null;

module.exports = LambdaLog;

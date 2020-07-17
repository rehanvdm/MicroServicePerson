'use strict';

/**
 * Throw these errors if you want to be able to catch this Error type in a catch block,
 * useful for stopping execution of a script and then knowing that it is a Error thrown
 * by us, that it is NOT an uncaught exception
 */

class HandledError extends Error
{
    constructor(...args)
    {
        super(...args);
        Error.captureStackTrace(this, HandledError);
    }
}

class ValidationError extends Error
{
    constructor(...args)
    {
        super(...args);
        Error.captureStackTrace(this, ValidationError);
    }
}

class AuthError extends Error
{
    constructor(...args)
    {
        super(...args);
        Error.captureStackTrace(this, AuthError);
    }
}

class LambdaErrors
{
    constructor()
    {

    }
}

LambdaErrors.HandledError = HandledError;
LambdaErrors.ValidationError = ValidationError;
LambdaErrors.AuthError = AuthError;

module.exports = LambdaErrors;

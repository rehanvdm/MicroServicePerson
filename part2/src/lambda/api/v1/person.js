const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const LambdaError = require('../helpers/lambda_errors');
const LambdaLog = require('../helpers/lambda_log');
const logger = new LambdaLog();

const person = require('../data_schema/person.js');
const DynamoPerson = require('../dynamo/Person.js');

const ApiBaseClass = require('./ApiBaseClass');

const PersonEventsV1 = require('../event_bridge/person-events-v1');
class Person extends ApiBaseClass
{
    constructor(aws, awsXray)
    {
        super();

        this.dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', maxRetries: 6, retryDelayOptions: { base: 50} });
        this.eventbridge = new aws.EventBridge();

        this.dynPerson = new DynamoPerson(this.dynamo, process.env.DYNAMO_TABLE);
        this.personEvents = new PersonEventsV1(this.eventbridge, awsXray, "default");
    }

    async create(authUser, body)
    {
        if(!body.data.client_id)
            throw new LambdaError.ValidationError("Field: client_id is required");
        if(!body.data.name || body.data.name.length > 50)
            throw new LambdaError.ValidationError("Field: name is required and can not be longer than 50 characters");
        if(!body.data.email || !body.data.email.length > 1024)
            throw new LambdaError.ValidationError("Field: email is required and can not be longer than 1024 characters");

        let now = moment().utc().format("YYYY-MM-DD HH:mm:ss.SSS");
        let newPerson = new person(uuidv4(), body.data.client_id, body.data.name, body.data.email, now);

        await this.dynPerson.Put(newPerson);

        await this.personEvents.person_created(body.data.client_id, body.data.name);

        return this.MethodReturn(newPerson);
    };

    async find_first(authUser, body)
    {
        if(!body.data.limit || body.data.limit > 100)
            throw new LambdaError.ValidationError("Field: limit is required and can not be more than 100");

        let ret = await this.dynPerson.FindFirst(body.data.limit);

        return this.MethodReturn(ret.data);
    };
}

module.exports = Person;

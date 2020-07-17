const person = require('../data_schema/person');
const BaseClass = require('./BaseClass');
const { v4: uuidv4 } = require('uuid');

class Person extends BaseClass
{
    constructor(dynamoClient, tableName)
    {
        super();

        this.TableName = tableName;
        this.DynamoClient = dynamoClient;
        this.PK = "persons";
    }

    /**
     *
     * @param _person
     * @returns {{SK: *, created_at: *, PK: *, client_id: *, email: *}}
     * @constructor
     */
    ToDynamoItem(_person)
    {
        let item = {
                    'PK' : this.GetDynamoValue(this.PK, "string"),
                    'SK' : this.GetDynamoValue(_person.person_id, "string"),
                    'client_id' : this.GetDynamoValue(_person.client_id, "string"),
                    'name' : this.GetDynamoValue(_person.name, "string"),
                    'email' : this.GetDynamoValue(_person.email, "string"),
                    'created_at' : this.GetDynamoValue(_person.created_at, "string"),
                };

        return item;
    }

    /**
     *
     * @param item
     * @returns {person}
     * @constructor
     */
    static FromDynamoItem(item)
    {
        return new person(
                            this.FromDynamoValue(item.SK),
                            this.FromDynamoValue(item.client_id),
                            this.FromDynamoValue(item.name),
                            this.FromDynamoValue(item.email),
                            this.FromDynamoValue(item.created_at)
                          );
    }


    /**
     *
     * @param {person} _person
     * @returns {Promise<{data: boolean}>}
     * @constructor
     */
    async Put(_person)
    {
        var params = {
            TableName: this.TableName,
            Item: this.ToDynamoItem(_person)
        };

        let resp = await this.DynamoClient.putItem(params).promise();
        return this.MethodReturn(true);
    };

    /**
     *
     * @param person_id
     * @param consistentRead
     * @returns {Promise<{data: *}>}
     * @constructor
     */
    async Find(person_id, consistentRead = false)
    {
        let params = {
            TableName: this.TableName,
            Key: {
                'PK' :this.GetDynamoValue(person_id, "string"),
                'SK': this.GetDynamoValue(this.SK)
            },
            ReturnConsumedCapacity: "TOTAL",
            ConsistentRead: consistentRead
        };

        let resp = (await this.DynamoClient.getItem(params).promise());
        let item = resp.Item ? Person.FromDynamoItem(resp.Item) : null;
        return this.MethodReturn(item);
    };

    /**
     *
     * @returns {Promise<{data: *}>}
     * @constructor
     */
    async FindFirst(limit)
    {
        let params = {
            TableName: this.TableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk" : this.GetDynamoValue(this.PK, "string")
            },
            Limit: limit,
            ScanIndexForward: false
        };

        let resp =  await this.DynamoClient.query(params).promise();
        let items  = [];

        let respLength = resp.Items.length;
        for(let i = 0; i < respLength; i++)
            items.push(Person.FromDynamoItem(resp.Items[i]));

        return this.MethodReturn( { Items: items } );
    };

}


module.exports = Person;

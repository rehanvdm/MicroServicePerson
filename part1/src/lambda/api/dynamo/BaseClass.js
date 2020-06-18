function isInt(n) { return n % 1 === 0; }

class BaseClass
{
    /**
     * If type is specified then it explicitly uses that, else will infer from the value. If array or object will be called recursively on all fields of that.
     * @param value
     * @param type Specify this if you don't want it to automatically detect the type, options are ["string", "number", "boolean", "array", "object"]
     * @returns {*}
     * @constructor
     */
    GetDynamoValue(value, type = null)
    {
        /* https://stackoverflow.com/questions/40855259/node-js-how-to-use-putitem-to-add-integer-to-list-w-dynamodb */

        if(type === null)
            type = typeof value;

        if (type === "string")
            return { S: value.toString() };
        else if (type === "number")
            return { N: value.toString() };
        else if (type === "boolean")
            return { BOOL: value };
        else if (value.constructor === Array && type === "string array")
        {
            let array = value.map((element) => { return element.toString(); });
            return { SS: array };
        }
        else if (value.constructor === Array && type === "number array")
        {
            let array = value.map((element) => { return element.toString(); });
            return { NS: array };
        }
        else if (value.constructor === Array)
        {
            let array = value.map((element) => { return this.GetDynamoValue(element); });
            return { L: array };
        }
        else if (type === "object" && value !== null)
        {
            let map = {};
            for (let key in value)
                map[key] = this.GetDynamoValue(value[key]);

            return { M: map };
        }
        else
            return null;
    }

    static FromDynamoValue(value)
    {
        /* https://stackoverflow.com/questions/40855259/node-js-how-to-use-putitem-to-add-integer-to-list-w-dynamodb */
        if(!value)
            return null;

        if(value.S)
            return value.S;
        else if (value.N)
            return (isInt(value.N) ? parseInt(value.N) : parseFloat(value.N));
        else if (typeof value.BOOL !== "undefined")
            return value.BOOL == true;
        else if (value.SS)
        {
            let array = value.SS.map((element) => { return element; });
            return array;
        }
        else if (value.NS)
        {
            let array = value.NS.map((element) => { return (isInt(value) ? parseInt(value) : parseFloat(value)); });
            return array;
        }
        else if (value.L)
        {
            let array = value.L.map((element) => { return this.FromDynamoValue(element); });
            return array;
        }
        else if ((typeof value === "object" || value.M) )
        {
            let map = {};
            for (let key in value.M)
                map[key] = this.FromDynamoValue(value.M[key]);

            return map;
        }
        else
            return null;
    }

    MethodReturn(data)
    {
        return { data: data };
    }
}

module.exports = BaseClass;
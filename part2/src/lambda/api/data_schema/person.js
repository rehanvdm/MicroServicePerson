
class person
{
    constructor(person_id, client_id, name, email, created_at)
    {
        this.person_id = person_id;
        this.client_id = client_id;
        this.name = name;
        this.email = email;
        this.created_at = created_at;
    }

    static FromObject(obj)
    {
        return Object.assign(new person(), obj);
    }

    Sanitize()
    {
        let cpyThis = Object.assign({}, this);
        return cpyThis;
    }
}

module.exports = person;

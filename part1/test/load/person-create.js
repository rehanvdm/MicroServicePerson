'use strict';

module.exports = {
    generateRandomData: personCreate
};

// Make sure to "npm install faker" first.
const Faker = require('faker');

function personCreate(userContext, events, done)
{
    // generate data with Faker:
    const name = `${Faker.name.firstName()} ${Faker.name.lastName()}`;
    const email = Faker.internet.exampleEmail();

    // add variables to virtual user's context:
    userContext.vars.name = name;
    userContext.vars.email = email;
    // continue with executing the scenario:
    return done();
}

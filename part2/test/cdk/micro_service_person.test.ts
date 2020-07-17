import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as MicroServicePerson from '../../lib/micro_service_person-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new MicroServicePerson.MicroServicePersonStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

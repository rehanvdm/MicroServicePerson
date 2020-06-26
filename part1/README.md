# MicroService Person

##### REFER TO THIS => https://github.com/rehanvdm/MicroService FOR AN EXPLANATION OF HOW TO USE THIS REPO

This is a stock standard CDK project using TypeScript. 

### Prerequisites:
1. AWS IAM profile setup in `..\.aws\credentials`, with Admin rights.
2. AWS Chatbot + Slack integration into a channel (optional)
3. AWS CDK bootstrap must have been run in the account already.

### Up and running
 * Change directory to ***/part1***
 * Run `npm install`
 * Change directory to ***/part1/test*** and run `npm install` (optinal: only if you want to run tests)
 * Search and replace `rehan-demo` with your AWS profile name

### Useful commands
 * `cdk diff`                   compare deployed stack with current state
 * `cdk deploy`                 deploy this stack to your default AWS account/region
 * `artillery-ping-pong`        does light load testing using `artillery`

## Testing 

Integration/end-to-end (e2e) and a basic load tests is written. Testing each api path and parameter combinations in certain tests. 
Both negative and positive tests are written. All code/src tests are in `/part1/test`.

### End-2-End

- Change the URL and other constants if needed in `part1/test/_helpers/lambda_app.js` at the bottom of the file.

##### Local testing
- Make sure that ``helper.TestAgainst = Helper.TEST_AGAINST__DEPLOYED;``  **IS** commented out.
- Then test the /v1/ping/pong method. Other tests can also be done in a similar fashion.
    ```
    node part1\test\node_modules\mocha\bin\_mocha --ui bdd  part1\test\e2e\lambda\api\test-ping.js --grep "^Test Ping Pong Returns Pong$"
    ```
  
##### Against deployed
- Make sure that ``helper.TestAgainst = Helper.TEST_AGAINST__DEPLOYED;``  **IS NOT** commented out.
- Then test the /v1/ping/pong method. Other tests can also be done in a similar fashion.
    ```
    node part1\test\node_modules\mocha\bin\_mocha --ui bdd  part1\test\e2e\lambda\api\test-ping.js --grep "^Test Ping Pong Returns Pong$"
    ```
  
### Load test
- Make sure you have `artillery` installed 
```
npm install -g artillery
```
- Change the URL in the file `part1/test/load/ping-pong.yml`
- Run the command using npm 
```
npm run artillery-ping-pong
```

## General

API Swagger file can be found at `part1\src\lambda\api\api-definition.yaml` or link => 
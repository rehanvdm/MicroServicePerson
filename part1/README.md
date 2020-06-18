# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


npm install -g artillery
artillery run hello.yml


# CloudWatch Log Insights Queries: 

## All audit log lines
```
fields @timestamp, @message
| filter level = "audit" 
| sort @timestamp desc
| limit 20
```

## All error log lines 
```
fields @timestamp, @message
| filter level = "error" 
| sort @timestamp desc
| limit 20
```

## All Audit records that have failed
```
fields @timestamp, @message, args.status_code
| filter level = "audit" and args.status = 0
| sort @timestamp desc
| limit 20
```

## ALL Audit record for specific trace(s)
```
fields @timestamp, level, msg, args.origin
| filter traceId = "7279de77-a13f-418e-9042-d29dde7e0c29"
| sort @timestamp desc
| limit 20
```

## Audit record for specific trace(s)
```
fields @timestamp, level, msg, args.origin
| filter traceId = "7279de77-a13f-418e-9042-d29dde7e0c29" AND level == "audit"
| sort @timestamp desc
| limit 20
```

## All activity for specific user_id
```
fields @timestamp, @message
| filter level = "audit" && strcontains(args.user_id, "rehan") 
| sort @timestamp desc
| limit 20
```

## TEST !! Most expensive API calls grouped by method and path
```
fields @timestamp, args.meta, args.origin_path, args.run_time
| sort @timestamp desc
| filter level="audit" AND args.status_code < 3000
| stats percentile(args.run_time,95) by concat(args.meta, " ", args.origin_path)
```

## TEST !! Most expensive API calls order by time desc
```
fields @timestamp, args.meta, args.origin_path, args.run_time
| sort args.run_time desc
| filter level="audit" AND args.run_time > "3000"
# | limit 20
# | stats percentile(args.run_time, 99) by bin(5m)
```
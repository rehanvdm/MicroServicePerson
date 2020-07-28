#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MicroServicePersonStack } from '../lib/micro_service_person-stack';

const app = new cdk.App();
new MicroServicePersonStack(app, 'MicroServicePerson-p2');

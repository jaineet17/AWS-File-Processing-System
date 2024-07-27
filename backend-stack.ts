import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'FileProcessingBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Create DynamoDB table
    const table = new dynamodb.Table(this, 'FileProcessingTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Create Lambda function
    const processingFunction = new lambda.Function(this, 'ProcessingFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TABLE_NAME: table.tableName,
      },
    });

    // Grant permissions
    bucket.grantReadWrite(processingFunction);
    table.grantReadWriteData(processingFunction);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'FileProcessingApi');

    const integration = new apigateway.LambdaIntegration(processingFunction, {
      proxy: true,
      // Add this to ensure Lambda function response includes CORS headers
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          },
        },
      ],
    });

    const postMethod = api.root.addMethod('POST', integration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    // Create VPC and EC2 instance
    const vpc = new ec2.Vpc(this, 'FileProcessingVpc', {
      maxAzs: 2,
    });

    const instance = new ec2.Instance(this, 'ProcessingInstance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      vpc,
    });

    // Create DynamoDB event to trigger EC2 instance
    const rule = new events.Rule(this, 'TableUpdateRule', {
      eventPattern: {
        source: ['aws.dynamodb'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['dynamodb.amazonaws.com'],
          eventName: ['PutItem'],
          requestParameters: {
            tableName: [table.tableName],
          },
        },
      },
    });

    rule.addTarget(new targets.AwsApi({
      service: 'EC2',
      action: 'startInstances',
      parameters: {
        InstanceIds: [instance.instanceId],
      },
    }));
  }
}
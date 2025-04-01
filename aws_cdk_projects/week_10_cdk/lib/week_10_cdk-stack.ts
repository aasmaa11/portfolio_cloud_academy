import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface MyBucketProps {
  bucketName: string;
  versioned: boolean;
  encryption: s3.BucketEncryption;
}

// Week10CdkStack is a type of cdk.Stack (CloudFormation stack)
export class Week10CdkStack extends cdk.Stack {
  // id: unique id of stack
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucketProps: MyBucketProps = {
      // bucketName is globally unique
      bucketName: 'My-S3-Bucket-SS-CDK-' + this.account,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED
    }

    // creating new bucket with constructor
    new s3.Bucket(this, 'MyFirstBucket', bucketProps)
  }
}

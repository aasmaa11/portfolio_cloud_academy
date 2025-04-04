let bucketName: string = 'my-bucket';
let maxItems: number = 100;
let isPublic: boolean = false;
let tags: string[] = ['project:cdk', 'env:dev'];


interface MyBucketProps {
    bucketName: string;
    versioned: boolean;
    encryption: s3.BucketEncryption;
}
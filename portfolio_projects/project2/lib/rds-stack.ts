import * as cdk from 'aws-cdk-lib';  
import { Construct } from 'constructs';  
import * as ec2 from 'aws-cdk-lib/aws-ec2';  
import * as rds from 'aws-cdk-lib/aws-rds';
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Credentials } from 'aws-cdk-lib/aws-rds';

// Props
interface RDSStackProps extends cdk.StackProps {  
    vpc: ec2.Vpc;  
    ec2Instance1: ec2.Instance;
    ec2Instance2: ec2.Instance;
}

// Stack structure
export class RDSStack extends cdk.Stack {  
    constructor(scope: Construct, id: string, props: RDSStackProps) {  
        super(scope, id, props);   
        const securityGroup = new ec2.SecurityGroup(this, 'MyDBSecurityGroup', {
            vpc: props.vpc, // specifies in which vpc ec2 is launched
            description: "Allow ec2 to connect to RDS DB"
        })

        securityGroup.connections.allowFrom(props.ec2Instance1, ec2.Port.tcp(3306));
        securityGroup.connections.allowFrom(props.ec2Instance2, ec2.Port.tcp(3306));

        // create database master user secret and store it in Secrets Manager
        const masterUserSecret = new Secret(this, "db-master-user-secret", {
            secretName: "db-master-user-secret",
            description: "Database master user credentials",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: "postgres" }),
                generateStringKey: "password",
                passwordLength: 16,
                excludePunctuation: true,
            },
        });

        // Primary RDS configuration will go here  
        const rds_instance = new rds.DatabaseInstance(
            this, 'MyPrivateDatabase', 
            {
                engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
                vpc: props.vpc,
                vpcSubnets: { // which type of subnet to use
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED
                },
                instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
                allocatedStorage: 20,
                maxAllocatedStorage: 30,
                deletionProtection: false,
                securityGroups: [securityGroup],
                credentials: Credentials.fromSecret(masterUserSecret),
                
            });
            cdk.Tags.of(rds_instance).add('Name', 'MyPrivateDatabase') // adds name tag to rds instance

            // defining output
            new cdk.CfnOutput(this, 'RDS_Endpoint', {
                value: "Hostname: " + rds_instance.instanceEndpoint.hostname + " & Port: " + rds_instance.instanceEndpoint.port,
                description: 'RDS Endpoint'
            })
    }  
}
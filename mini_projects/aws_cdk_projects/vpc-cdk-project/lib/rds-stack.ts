import * as cdk from 'aws-cdk-lib';  
import { Construct } from 'constructs';  
import * as ec2 from 'aws-cdk-lib/aws-ec2';  
import * as rds from 'aws-cdk-lib/aws-rds';

// Props
interface RDSStackProps extends cdk.StackProps {  
    vpc: ec2.Vpc;  
}

// Stack structure
export class RDSStack extends cdk.Stack {  
    constructor(scope: Construct, id: string, props: RDSStackProps) {  
        super(scope, id, props);   
        
        // RDS configuration will go here  
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
                deletionProtection: false
                
            });
            cdk.Tags.of(rds_instance).add('Name', 'MyPrivateDatabase') // adds name tag to rds instance

                // defining output
            new cdk.CfnOutput(this, 'RDS_Endpoint', {
                value: "Hostname: " + rds_instance.instanceEndpoint.hostname + " & Port: " + rds_instance.instanceEndpoint.port,
                description: 'RDS Endpoint'
            })
    }  
}
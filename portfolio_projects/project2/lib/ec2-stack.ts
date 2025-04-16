import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import {
    Policy,
    Role,
    PolicyStatement,
    ServicePrincipal
 } from 'aws-cdk-lib/aws-iam';

// Props
interface EC2StackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}


export class EC2Stack extends cdk.Stack {
    public readonly instance1: ec2.Instance
    public readonly instance2: ec2.Instance
    constructor(scope: Construct, id: string, props: EC2StackProps) {
        super(scope, id, props);

        const securityGroup = new ec2.SecurityGroup(this, 'MyAppSecurityGroup', {
            vpc: props.vpc, // specifies in which vpc ec2 is launched
            description: "Allows SSH access from my IP address"
        })
        const cidr_ip = "...";

        securityGroup.addIngressRule(
            ec2.Peer.ipv4(cidr_ip),
            ec2.Port.tcp(22));

        const role = new Role(
            this,
            'secretsManagerAccessRole', // this is a unique id that will represent this resource in a Cloudformation template
            { assumedBy: new ServicePrincipal('ec2.amazonaws.com') }
        )
        const policyStatement = new PolicyStatement({
            resources: ['*'],
            actions: [            
            'secretsmanager:GetSecretValue',
            'secretsmanager:DescribeSecret',
            'secretsmanager:PutSecretValue',
            'secretsmanager:UpdateSecretVersionStage'
            ]
        })

        const policyName = 'SecretsManagerAccessPolicy';
        const policy = new Policy(this, policyName, { 
        policyName,
        statements: [policyStatement],
        });

        role.attachInlinePolicy(policy);

        const cfnKeyPair = new ec2.CfnKeyPair(this, 'MyCfnKeyPair', {
            keyName: 'keyName',
            publicKeyMaterial: [
                '...'
            ].join('')
            });

        // EC2 instance 1 in AZ 1
        this.instance1 = new ec2.Instance(this, 'MyPublicEC2-AZ1', {
            vpc: props.vpc, // specifies in which vpc ec2 is launched
            role: role,
            vpcSubnets: { // which type of subnet to use
                subnetType: ec2.SubnetType.PUBLIC,
                availabilityZones: [props.vpc.availabilityZones[0]] // put it in 1st AZ
            },
            machineImage: new ec2.AmazonLinuxImage({ // specifies OS to use
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            securityGroup: securityGroup,
            keyName: cfnKeyPair.keyName
        })
        cdk.Tags.of(this.instance1).add('Name', 'MyPublicEC2-AZ1') // adds name tag to ec2 instance
        


        // EC2 instance 2 in AZ 2
        this.instance2 = new ec2.Instance(this, 'MyPublicEC2-AZ2', {
            vpc: props.vpc, // specifies in which vpc ec2 is launched
            role: role,
            vpcSubnets: { // which type of subnet to use
                subnetType: ec2.SubnetType.PUBLIC,
                availabilityZones: [props.vpc.availabilityZones[1]] // put it in AZ 2
            },
            machineImage: new ec2.AmazonLinuxImage({ // specifies OS to use
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            securityGroup: securityGroup,
            keyName: cfnKeyPair.keyName
        })
        cdk.Tags.of(this.instance2).add('Name', 'MyPublicEC2-AZ2') // adds name tag to ec2 instance
    }

}

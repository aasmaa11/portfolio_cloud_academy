# Project 2 - AWS Migration

I was tasked to build an AWS infrastructure via Infrastructure as Code for an imaginary healthcare technology company. The infrastructure had to be highly available and secured.

## Setup instructions

## Architecture Diagram

![image info](./project2_diagram.png)

- To meet the availability requirement, I deployed a VPC with 2 availability zones. Each availability zone contains a public and private subnet.
- The public subnet contains an EC2 instance for which access was secured with a security group.
- The private subnet contains an RDS instance for which access was also secured with a security group.

## Testing Evidence

### Screenshot of successful EC2 to RDS connection

### Screenshot of security group configurations

### Evidence of successful cdk deploy and cdk destroy

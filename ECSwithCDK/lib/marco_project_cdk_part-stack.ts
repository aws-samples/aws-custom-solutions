import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as iam from 'aws-cdk-lib/aws-iam'

import * as ecs from 'aws-cdk-lib/aws-ecs'

import * as custom_resource from 'aws-cdk-lib/custom-resources'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { IpTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MarcoProjectCdkPartStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Creating a VPC
    const vpc = new ec2.Vpc(this, 'VPC',{
      cidr: "10.0.0.0/16",
      // maxAzs: 4 // when you don't specify this and also you don't specify account and region in the bin/project_name.ts file, the default public subnet and private subnet are 2 each. Further, if you specify the account and region the default is 3 AZ.
    });
    
    // Creating 2 Security groups
    const sg1 = new ec2.SecurityGroup(this, 'SG1', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Public SG for internet facing LB'
      
    });

    sg1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere',
    );

    sg1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow HTTPS traffic from anywhere',
    );
    const sg2 = new ec2.SecurityGroup(this, 'SG2', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Private SG for internal LB'
    });

    sg2.addIngressRule(
      ec2.Peer.ipv4("10.0.0.0/16"),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere',
    );

    sg2.addIngressRule(
      ec2.Peer.ipv4("10.0.0.0/16"),
      ec2.Port.tcp(443),
      'allow HTTPS traffic from anywhere',
    );

    // Creating two load balancer one public/internet facing and the other one internal
    const public_lb = new elbv2.ApplicationLoadBalancer(this, 'publicLB', {
      vpc: vpc,
      internetFacing: true
    });

    const private_lb = new elbv2.ApplicationLoadBalancer(this, 'privateLB', {
      vpc: vpc,
    });

    // Creating two target group for a service to be added in public & private load balancer
    
    const public_tg = new elbv2.ApplicationTargetGroup(this, "publicTG", {
      vpc: vpc,
      targetGroupName: 'publicTG',
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP
    });

    const private_tg = new elbv2.ApplicationTargetGroup(this, "privateTG", {
      vpc: vpc,
      targetGroupName: 'privateTG',
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP
    });

    // Creating a listener with default action as forward, protocol as http, and port as 80, and target groups as public and private TG respectively

    const public_listener = new elbv2.ApplicationListener(this, "publicListener",{
      loadBalancer: public_lb,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      defaultAction: elbv2.ListenerAction.forward([public_tg])
    });

    const private_listener = new elbv2.ApplicationListener(this, "privateListener",{
      loadBalancer: private_lb,
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      defaultAction: elbv2.ListenerAction.forward([private_tg])
    });

    //Creating a Cluster

    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc: vpc,
      clusterName: 'FargateCluster'
    });   

    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });
    const container = fargateTaskDefinition.addContainer("privateContainer", {
      image: ecs.ContainerImage.fromRegistry("public.ecr.aws/p6v0z4t6/myrepo:latest"),
      // ... other options here ...
    });

    container.addPortMappings({
      containerPort: 80,
    })
    
    
    // Creating a service using Custom resource, as adding a service to multiple target groups is not supported natively by CDK, only SDK/CLI supports the same
    const params = {
        taskDefinition: fargateTaskDefinition.taskDefinitionArn,
        loadBalancers:[
          {  
             "targetGroupArn":public_tg.targetGroupArn,
             "containerName":container.containerName,
             "containerPort":80
          },
          {  
             "targetGroupArn":private_tg.targetGroupArn,
             "containerName":container.containerName,
             "containerPort":80
          }
       ],
       networkConfiguration: { 
        "awsvpcConfiguration": { 
           "securityGroups":  [sg2.securityGroupId] ,
           "subnets": ["subnet-01e56d13d9324a189", "subnet-0a293c0c55569ebd2","subnet-05b28d7db564d658f"]
        }
     },
       cluster: cluster.clusterArn,
       serviceName: 'fargate-service',
       desiredCount: 0,
       launchType: 'FARGATE'
    }
    const policyStatement = new iam.PolicyStatement({ // Restrict to listing and describing tables
      actions: ['*'],
      resources: ['*'],
    })
    const createService = new custom_resource.AwsCustomResource(this, "CreateService", 
      {
        onCreate: {
          service: 'ECS',
          action: "createService",
          parameters: params,
          physicalResourceId: custom_resource.PhysicalResourceId.of(Date.toString())
        },
        policy: custom_resource.AwsCustomResourcePolicy.fromStatements(
          [policyStatement]
        )
      }
     )
  }
}

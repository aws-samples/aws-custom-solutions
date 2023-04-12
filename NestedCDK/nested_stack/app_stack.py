from aws_cdk import (
    NestedStack as NestedStack,
    aws_ec2 as ec2,
    aws_s3 as s3,
    aws_iam as iam
)

import aws_cdk as cdk

from constructs import Construct

class AppStack (NestedStack):
    def __init__(self, scope: Construct, id: str, vpc: ec2.Vpc, bucket: s3.Bucket, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        ec2.Instance(
            self,
            f'{id}Ec2Instance',
            instance_type=ec2.InstanceType('t2.micro'),
            machine_image=ec2.MachineImage.generic_linux(
                ami_map={
                    'us-west-2': 'ami-0efa651876de2a5ce'
                }
            ),
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(subnet_group_name='public')
        )
        new_policy = iam.Policy(
            self, "s3_policy", 
            statements=[iam.PolicyStatement(
            actions=["s3:GetBucket"],
            resources=[bucket.bucket_arn]
            )]
        )

        # print(new_policy._get_resource_arn_attribute)
        # print(bucket)
        role = iam.Role(self, "Role",
    assumed_by=iam.CompositePrincipal(iam.ServicePrincipal("gamelift.amazonaws.com"))
)
        
        role.add_managed_policy(new_policy)
        
        self.kms_policy = iam.PolicyDocument(
    statements=[iam.PolicyStatement(
        actions=["kms:Create*", "kms:Describe*", "kms:Enable*", "kms:List*", "kms:Put*"
        ],
        principals=[iam.AccountRootPrincipal()],
        resources=["*"]
    )]
)
from aws_cdk import (
    NestedStack as NestedStack,
    aws_ec2 as ec2,
    aws_s3 as s3,
)

from constructs import Construct


class SkeletonStack(NestedStack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.vpc = ec2.Vpc(self, 'SkeletonVpc',
            cidr='10.0.0.0/16',
            max_azs=99,  # use all available AZs,
            subnet_configuration=[
                {
                    'cidrMask': 28,
                    'name': 'public',
                    'subnetType': ec2.SubnetType.PUBLIC
                },
                {
                    'cidrMask': 28,
                    'name': 'private',
                    'subnetType': ec2.SubnetType.PRIVATE_WITH_NAT
                }
            ],
        
        )

        self.bucket = s3.Bucket(self, 'SkeletonBucket',
                           
                            versioned=True,
                                 )

        

        
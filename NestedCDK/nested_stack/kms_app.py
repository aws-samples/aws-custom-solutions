from aws_cdk import (
    NestedStack as NestedStack,
    aws_ec2 as ec2,
    aws_s3 as s3,
    aws_iam as iam,
    aws_kms as kms
)

import aws_cdk as cdk

from constructs import Construct

class KmsStack (NestedStack):
    def __init__(self, scope: Construct, id: str, kms_policy: iam.Policy, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)
        key = kms.Key(self, "MyKey",
            policy=kms_policy
            )


        
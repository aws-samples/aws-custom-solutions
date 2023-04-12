#!/usr/bin/env python3
import os

import aws_cdk as cdk

# from aws_cdk import core as core


# from nested_stack.nested_stack_stack import NestedStackStack
from nested_stack.skeleton_stack import SkeletonStack
from nested_stack.app_stack import AppStack
from nested_stack.kms_app import KmsStack

app = cdk.App()

main_stack = cdk.Stack(app, 'MainStack', env={'account': '<account-id>','region': 'us-west-2'})

skeleton = SkeletonStack(main_stack, 'skeleton')

ec2_app = AppStack(main_stack, 'App', vpc=skeleton.vpc, bucket=skeleton.bucket)

kms_app = KmsStack(main_stack,'KmsApp', kms_policy=ec2_app.kms_policy)

app.synth()

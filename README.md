## CDK EXAMPLES 

The repository is being made to help you through different architectures using CDK. The Repository currently has an example related to ECS implemtation in CDK.

This example is aimed to guide customer on how implement one ECS Service which is a target of two load balancers the help of CDK.

For more information, please look at the following:

1. [ECSwithCDK](https://github.com/aws-samples/amazon-ecs-cdk-examples/tree/main/ECSwithCDK)

## Roadmap

- Adding the DNS Configuration setup to the current setup by adding public and private Route53 Hosted Zone.

- Creating 2 or more services and changing the architecture a but by adding a different security group for the ECS Service so that different services use different Security Group which in turn will decide that a service is to be internal only or both internal and external facing.

- Change the CDK code structure to a nested stack code structure, as one will have better maintainability.


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.


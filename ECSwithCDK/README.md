# CDK Code for ECS with single service and mutliple load balancer

This is how one can use one public load balancer and one internal load balancer along with assigning one ECS service to the 2 target groups(public and private) which at the end are linked to the two load balancer.


## How to deploy:

* Open 'bin/marco_project_cdk_part.ts' and edit the account id and the region you want to deploy the resources to.

* Run 'cdk synth'

* Run `cdk deploy`

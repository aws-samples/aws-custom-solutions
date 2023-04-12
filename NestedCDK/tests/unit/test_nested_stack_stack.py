import aws_cdk as core
import aws_cdk.assertions as assertions

from nested_stack.nested_stack_stack import NestedStackStack

# example tests. To run these tests, uncomment this file along with the example
# resource in nested_stack/nested_stack_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = NestedStackStack(app, "nested-stack")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })

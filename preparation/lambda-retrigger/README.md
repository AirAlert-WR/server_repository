This AWS lambda function is necessary for retriggering the measurement cycles for every controller, after each waiting time interval (attribute of the controller) has passed.

1. Create a new AWS Lambda function with the name "TODO" and place the [code](lambda.js) there.
2. Go to the rules section inside the function configuration, switch to **JSON mode** and input [this passage](rule.json). Also, assign the newly created rule to the lambda function, as it's necessary for acquiring execution permissions.

For more detailed (cloud-specific) instructions, please refer to the [AWS documentation](https://docs.aws.amazon.com/) as well as the help section of your AWS console.

# Big disclaimer! Please read!!!
While placing the rules, policies and the function source code, please make sure the **ARN of all resources is replaced with YOUR OWN ONE**, otherwise the execution will throw **resource permission errors**.

# Configure IoT Core for the cloud

## A. Certificate for the controllers

1. After opening "AWS IoT" in your console, navigate to "Manage"->"Security"->"Policies" by using the sidebar menu.
2. Create a new policy with the following settings:
   - Name: "**airalertcontrollerpolicy**"
   - For the rules, **copy and paste** the contents of the [aacp.json](aacp.json) file residing inside this forder
3. Activate the policy!!!

## B. Lambda for retrigger

1. After opening "AWS Lambda" in your console, create a new function called **HandleMeasurementLambda**. Open it.
2. Navigate to the "Configuration" tab, select "Authorizations" and click onto the link of the associated role, something similar to **"HandleMeasurementLambda-role-sx7xlivl"**. This will redirect you to the **IAM-Service** of AWS.
3. Inside IAM, under the "Authorizations" tab, expand the entry named like **"AWSLambdaBasicExecutionRole-9292a..."**, switch to **JSON input** and place the contents of the [aalr.json](aalr.json) file there.
4. Save all changes and navigate back to "Lambda".
5. Now paste the contents of the [aalm.mjs](aalm.mjs) file into the (big) embedded code editor. Click **Deploy**, wait and save everything.

## C. Rule for retrigger

1. Navigate back to "AWS IoT" to "Manage"->"Passing Messages"->"Rules".
2. Create a new rule called **AirAlertMeasurementListener**.
3. Place the following phrase into the SQL memo:

   SELECT topic() as id, * as data FROM '+/sensor'

4. At the **rule actions**, please select "Lambda" and later the recently created function, "HandleMeasurementLambda" in this case.
5. Confirm and enable the rule.

### The IoT and retrigger section is now ready to use.

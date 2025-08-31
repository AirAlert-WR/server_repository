import { IoTDataPlaneClient, GetThingShadowCommand, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const iotDataClient = new IoTDataPlaneClient({});
const ddbClient = new DynamoDBClient({});

export const handler = async (event) => {
  try {

    console.log("Received event:", JSON.stringify(event));

    // Changed parsing infrastructure according to IoT rule
    const topic = event.id;
    const payload = event.data;

    const thingId = extractThingId(topic); // "controller-Test123/sensor" → "controller-Test123"

    // Check if controller is registered (will be ignored if not the case)
    const authorized = await isControllerAuthorized(thingId);
    if (!authorized) {
      console.warn(`Controller ${thingId} is NOT given. Ignoring data.`);
      return { statusCode: 403, body: "Unauthorized controller" };
    }

    // TRANSFORMING DATA into DynamoDB object format
    const transformedData = {};
    for (const key in payload) {
      if (Object.hasOwnProperty.call(payload, key)) {
        const value = payload[key];
        // Überprüfen, ob der Wert eine Zahl ist
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(value))) {
          transformedData[key] = { N: String(value) }; // Numbers
        } else if (typeof value === 'string') {
          transformedData[key] = { S: value }; // Strings
        } else if (typeof value === 'boolean') {
          transformedData[key] = { BOOL: value }; // Booleans
        }
        // Other types not important
      }
    }

    // Save data to DynamoDB
    await ddbClient.send(new PutItemCommand({
      TableName: "AirAlertData",
      Item: {
        controllerID: { S: thingId },
        timeStampISO: { S: new Date(Date.now()).toISOString() },
        data: { M: transformedData },
      }
    }));

    // Fetch interval from Device Shadow
    const shadow = await iotDataClient.send(new GetThingShadowCommand({
      thingName: thingId
    }));

    // Converting shadow payload and fetching interval
    const shadowPayload = JSON.parse(Buffer.from(shadow.payload).toString("utf-8"));
    console.log(shadowPayload)
    const interval = shadowPayload.state?.desired?.settings?.interval || 30; // Default: 30 sec
    console.log(`Waiting ${interval} seconds before sending next measure command...`);

    // Waiting for the interval's length
    await sleep(interval * 1000);
    console.log("Waited")

    // Send command to {thingId}/task
    await iotDataClient.send(new PublishCommand({
      topic: `${thingId}/task`,
      qos: 0,
      payload: Buffer.from(JSON.stringify({ name: "sensor" }))
    }));

  } catch (error) {
    console.error("Error in HandleMeasurementLambda:", error);
  }
};


function extractThingId(topic) {
  // Example topic: "controller-Test123/sensor"
  return topic.split("/")[0]; // "controller-Test123"
}

async function isControllerAuthorized(thingId) {
  const apiUrl = "https://8nh6ehtws2.execute-api.eu-central-1.amazonaws.com/dev/controllers";

  try {
    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) {
      console.error("API responded with status:", response.status);
      return false;
    }
    const controllers = await response.json();

    // Expecting: List of Controller IDs (should be given)
    return controllers.some(c => c === thingId);
  } catch (err) {
    console.error("Error checking controller authorization:", err);
    return false;
  }
}


function sleep(ms) {
  // Asynchronous internal timeout command
  return new Promise(resolve => setTimeout(resolve, ms));
}

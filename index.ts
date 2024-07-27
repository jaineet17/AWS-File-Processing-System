import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { nanoid } from 'nanoid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event: any) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let inputText, fileContent;

    // Check if the event body is a string (it might be pre-parsed in some cases)
    if (typeof event.body === 'string') {
      const body = JSON.parse(event.body);
      inputText = body.inputText;
      fileContent = body.fileContent;
    } else if (typeof event.body === 'object') {
      // If it's already an object, use it directly
      inputText = event.body.inputText;
      fileContent = event.body.fileContent;
    } else {
      throw new Error('Invalid event body format');
    }

    if (!inputText || !fileContent) {
      throw new Error('Missing inputText or fileContent');
    }

    const id = nanoid();

    // Upload file to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${id}.input`,
      Body: fileContent,
    }));

    // Save to DynamoDB
    await dynamoClient.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: { S: id },
        input_text: { S: inputText },
        input_file_path: { S: `${process.env.BUCKET_NAME}/${id}.input` },
      },
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Processing started", id }),
    };
  } catch (error: unknown) {
    console.error('Error:', error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ 
        message: "Error processing request", 
        error: error instanceof Error ? error.message : String(error)
      }),
    };
  }
};

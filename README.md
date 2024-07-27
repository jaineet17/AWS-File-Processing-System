# AWS File Processing System

This project implements a serverless file processing system using AWS services and a React frontend. It allows users to upload a file and input text, which are then processed and stored in AWS S3 and DynamoDB.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Development](#development)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

The AWS File Processing System provides a web interface for users to submit a text input and a file. The system processes these inputs, stores the file in S3, saves metadata in DynamoDB, and triggers an EC2 instance for further processing.

## Architecture

- Frontend: React.js
- Backend: 
  - AWS Lambda for serverless processing
  - Amazon API Gateway for REST API
  - Amazon S3 for file storage
  - Amazon DynamoDB for metadata storage
  - Amazon EC2 for additional processing (triggered by DynamoDB events)
- Infrastructure as Code: AWS CDK (TypeScript)

## Prerequisites

- Node.js (v14 or later)
- npm
- AWS CLI configured with appropriate permissions
- AWS CDK CLI
- An AWS account with necessary permissions
## Setup

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/aws-file-processing-system.git
    cd aws-file-processing-system
    ```

2. **Install backend dependencies**:
    ```sh
    cd backend
    npm install
    ```
   
3. **Install frontend dependencies**:
    ```sh
    cd ../frontend
    npm install
    ```
   
4. **Configure the frontend**:
    Create a `.env` file in the frontend directory with:
    ```plaintext
    REACT_APP_API_URL=https://your-api-gateway-url.com
    ```
## Project Structure
```plaintext
aws-file-processing-system/
├── backend/
│  ├── lib/
│  │  └── backend-stack.ts  # CDK stack definition
│  └── lambda/
│     └── index.ts          # Lambda function code
└── frontend/
    └── src/
        └── App.tsx           # React frontend component
```
## Usage

1. Deploy the backend:
cd backend
cdk deploy

3. Start the frontend development server:
cd frontend
npm start
  
4. Open a web browser and navigate to `http://localhost:3000`

5. Use the web interface to upload a file and input text. The system will process your input and display the results.

## Development

### Backend

The `backend-stack.ts` file defines the AWS infrastructure:
- S3 bucket for file storage
- DynamoDB table for metadata
- Lambda function for processing
- API Gateway for REST API
- EC2 instance for additional processing
- EventBridge rule to trigger EC2 on DynamoDB updates

The Lambda function (`index.ts`) handles:
- Parsing input from API Gateway
- Uploading files to S3
- Storing metadata in DynamoDB
- Error handling and CORS configuration

### Frontend

The `App.tsx` React component provides:
- A form for text input and file upload
- Asynchronous submission to the API
- Display of processing results or errors

## Deployment

1. Backend: Run `cdk deploy` in the `backend` directory
2. Frontend: Deploy the React app to your preferred static hosting service (e.g., AWS S3 + CloudFront, Netlify, Vercel)

## Security Considerations

- The system uses AWS managed encryption for S3
- CORS is configured to allow requests from any origin ('*') - consider restricting this in production
- Ensure proper IAM roles and permissions are set up for the Lambda function and EC2 instance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

import { APIGatewayProxyResult } from 'aws-lambda'

export function createResponse(statusCode: number, bodyAsJson: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(bodyAsJson)
  }
}

export function createErrorResponse(error: string): APIGatewayProxyResult {
  return createResponse(500, { error })
}

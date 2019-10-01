import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createResponse, createErrorResponse } from './utils'
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../dataLayer/TodosAccess'

const logger = createLogger('getTodos')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('GetTodos', event)
    // Get all TODO items for a current user
    const items = await todosAccess.getAllTodos(getUserId(event))
    return createResponse(200, { items })
  } catch (e) {
    return createErrorResponse(e && e.message ? e.message : 'GetTodos error')
  }
}

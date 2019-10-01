import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createErrorResponse, createResponse } from './utils'
import { TodosAccess } from '../../dataLayer/TodosAccess'
import { getUserId } from '../utils'

const logger = createLogger('deleteTodo')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters } = event
    if (!pathParameters) return createErrorResponse('Missing path parameters')
    const todoId = pathParameters.todoId
    if (!todoId) return createErrorResponse('Missing todoId path parameter')
    logger.info('DeleteTodo', todoId)
    // Remove a TODO item by id
    await todosAccess.deleteTodo(getUserId(event), todoId)
    return createResponse(200, {})
  } catch (e) {
    return createErrorResponse(e && e.message ? e.message : 'DeleteTodo error')
  }
}

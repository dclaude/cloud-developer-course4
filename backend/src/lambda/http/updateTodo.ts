import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { TodosAccess } from '../../dataLayer/TodosAccess'
import { createResponse, createErrorResponse } from './utils'
import { getUserId } from '../utils'

const logger = createLogger('updateTodo')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters, body } = event
    if (!pathParameters) return createErrorResponse('Missing path parameters')
    if (!body) return createErrorResponse('Missing body')
    // Update a TODO item with the provided id using values in the "updatedTodo" object
    const { todoId } = pathParameters
    if (!todoId) return createErrorResponse('Missing todoId path parameter')
    const updatedTodo: UpdateTodoRequest = JSON.parse(body)
    logger.info('UpdateTodo', updatedTodo)
    await todosAccess.updateTodo(getUserId(event), todoId, updatedTodo)
    return createResponse(200, {})
  } catch (e) {
    return createErrorResponse(e && e.message ? e.message : 'UpdateTodo error')
  }
}

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createResponse, createErrorResponse } from './utils'
import { getUserId } from '../utils'
import { TodosAccess } from '../../dataLayer/TodosAccess'

const logger = createLogger('createTodo')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { body } = event
    if (!body) return createErrorResponse('Missing body')
    // Implement creating a new TODO item
    const newTodo: CreateTodoRequest = JSON.parse(body)
    logger.info('CreateTodo', newTodo)
    const item = await todosAccess.createTodo(getUserId(event), newTodo)
    return createResponse(201, {
      item
    })
  } catch (e) {
    return createErrorResponse(e && e.message ? e.message : 'CreateTodo error')
  }
}

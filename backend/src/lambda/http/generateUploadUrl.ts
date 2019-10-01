import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createResponse, createErrorResponse } from './utils'
import { ImagesAccess } from '../../dataLayer/ImagesAcces'
import { TodosAccess } from '../../dataLayer/TodosAccess'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')
const imagesAccess = new ImagesAccess()
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { pathParameters } = event
    if (!pathParameters) return createErrorResponse('Missing path parameters')
    const todoId = pathParameters.todoId
    if (!todoId) return createErrorResponse('Missing todoId path parameter')
    logger.info('GenerateUploadUrl', todoId)
    // Return a presigned URL to upload a file for a TODO item with the provided id
    const uploadUrl = imagesAccess.getUploadUrl(todoId)
    const attachmentUrl = imagesAccess.getAttachmentUrl(todoId)
    await todosAccess.updateTodoAttachmentUrl(getUserId(event), todoId, attachmentUrl)
    return createResponse(200, { uploadUrl })
  } catch (e) {
    return createErrorResponse(e && e.message ? e.message : 'GenerateUploadUrl error')
  }
}

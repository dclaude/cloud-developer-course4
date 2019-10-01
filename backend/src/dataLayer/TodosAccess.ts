import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const {
  env: { TODOS_TABLE, TODOS_TABLE_USER_ID_INDEX }
} = process

export class TodosAccess {
  private TableName: string
  private userIdIndex: string
  constructor(private client = new AWS.DynamoDB.DocumentClient()) {
    if (!TODOS_TABLE) throw new Error('Missing todosTable')
    if (!TODOS_TABLE_USER_ID_INDEX) throw new Error('Missing todosTable userIdIndex')
    this.TableName = TODOS_TABLE
    this.userIdIndex = TODOS_TABLE_USER_ID_INDEX
  }
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const { client, TableName, userIdIndex } = this
    const { Items } = await client
      .query({
        TableName,
        IndexName: userIdIndex, // use GSI
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    return Items ? (Items as TodoItem[]) : []
  }
  async createTodo(userId: string, { name, dueDate }: CreateTodoRequest): Promise<TodoItem> {
    const { client, TableName } = this
    const todoId = uuid.v4()
    const item: TodoItem = {
      todoId,
      userId,
      createdAt: new Date().toISOString(),
      name,
      dueDate,
      done: false
    }
    await client.put({ TableName, Item: item }).promise()
    return item
  }
  async updateTodo(userId: string, todoId: string, { name, dueDate, done }: UpdateTodoRequest): Promise<void> {
    const { client, TableName } = this
    await client
      .update({
        TableName,
        Key: { todoId },
        ConditionExpression: 'userId = :userId',
        // attribute 'name' is a reserved keyword, use '#N' instead
        ExpressionAttributeNames: { '#N': 'name' },
        UpdateExpression: 'set #N=:name, dueDate=:dueDate, done=:done',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':name': name,
          ':dueDate': dueDate,
          ':done': done
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }
  async deleteTodo(userId: string, todoId: string): Promise<void> {
    const { client, TableName } = this
    await client
      .delete({
        TableName,
        Key: { todoId },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
  }
  async updateTodoAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
    const { client, TableName } = this
    await client
      .update({
        TableName,
        Key: { todoId },
        ConditionExpression: 'userId = :userId',
        UpdateExpression: 'set attachmentUrl=:attachmentUrl',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':attachmentUrl': attachmentUrl
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }
}

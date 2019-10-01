// Once your application is deployed, copy an API id here so that the frontend could interact with it
export const apiEndpoint =
  'https://lufn6qepp0.execute-api.eu-west-3.amazonaws.com/dev'

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map
  domain: 'todo-dclaude.auth0.com', // Auth0 domain
  clientId: 'FJYtZg6oTmssRi33M7KJnQy8ULIQgbcr', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

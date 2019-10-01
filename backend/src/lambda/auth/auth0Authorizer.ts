import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getSigningKeys, getSigningKey } from './utils'

const logger = createLogger('auth')

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jsonWebKeySetUrl = 'https://todo-dclaude.auth0.com/.well-known/jwks.json'

// cache the reponse of the GET request
const keysPromise = getSigningKeys(jsonWebKeySetUrl)

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const { authorizationToken } = event
    if (!authorizationToken) {
      throw new Error('Missing authorizationToken')
    }
    logger.info('Authorizing a user', authorizationToken)
    const jwtToken = await verifyToken(authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('JWT', jwt)
  const { header, payload } = jwt
  if (!header || header.alg !== 'RS256') {
    throw new Error('Token is not RS256 encoded')
  }
  // Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const { kid } = header
  if (!kid) {
    throw new Error('Missing kid')
  }
  const key = await getSigningKey(keysPromise, kid)
  if (!key) {
    throw new Error('Certificate not found')
  }
  const { publicKey: certificate } = key
  verify(
    token,
    certificate,
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
  return payload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }
  const split = authHeader.split(' ')
  const token = split[1]
  return token
}

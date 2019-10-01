import Axios from 'axios'
import { createLogger } from '../../utils/logger'

// from https://auth0.com/blog/navigating-rs256-and-jwks/

const logger = createLogger('auth-jwt')

interface JsonWebKey {
  use: string
  kty: string
  kid: string
  x5c: string[]
  n: string
  e: string
}

interface JsonWebKeySet {
  keys: JsonWebKey[]
}

interface PublicKey {
  kid: string
  publicKey: string
}

function certToPEM(cert: string): string {
  const res = cert.match(/.{1,64}/g)
  if (!res) throw new Error(`certToPEM() invalid cert[${cert}]`)
  let pem = res.join('\n')
  pem = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return pem
}

export async function getSigningKeys(
  jsonWebKeySetUrl: string
): Promise<PublicKey[]> {
  try {
    const res = await Axios.get<JsonWebKeySet>(jsonWebKeySetUrl)
    const {
      data: { keys }
    } = res
    return keys
      .filter(
        ({ use, kty, kid, x5c, n, e }) =>
          use === 'sig' && // JWK property `use` determines the JWK is for signing
          kty === 'RSA' && // We are only supporting RSA (RS256)
          kid && // The `kid` must be present to be useful for later
          ((x5c && x5c.length) || (n && e)) // Has useful public keys
      )
      .map(({ kid, x5c }) => ({ kid, publicKey: certToPEM(x5c[0]) }))
      .filter(({ publicKey }) => publicKey)
  } catch (e) {
    logger.error('getSigningKeys error', e)
    return []
  }
}

export async function getSigningKey(
  keysPromise: Promise<PublicKey[]>,
  kid: string
): Promise<PublicKey | undefined> {
  const keys = await keysPromise
  return keys.find(key => key.kid === kid)
}

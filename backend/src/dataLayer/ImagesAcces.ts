import * as AWS from 'aws-sdk'

const {
  env: { IMAGES_S3_BUCKET, SIGNED_URL_EXPIRATION }
} = process

export class ImagesAccess {
  private Bucket: string
  private Expires: Number
  constructor(private client = new AWS.S3({ signatureVersion: 'v4' })) {
    if (!IMAGES_S3_BUCKET) throw new Error('Missing S3 bucket')
    if (!SIGNED_URL_EXPIRATION) throw new Error('Missing SignedURL expiration')
    this.Bucket = IMAGES_S3_BUCKET
    this.Expires = Number(SIGNED_URL_EXPIRATION)
  }
  getUploadUrl(todoId: string): string {
    const { client, Bucket, Expires } = this
    // need IAM permissions to be able to perform this call
    return client.getSignedUrl('putObject', {
      Bucket,
      Key: todoId,
      Expires
    })
  }
  getAttachmentUrl(todoId: string): string {
    const { Bucket } = this
    return `https://${Bucket}.s3.amazonaws.com/${todoId}`
  }
}

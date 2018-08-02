interface CdnUploader {
  upload(asset: Buffer): Promise<String>;
}

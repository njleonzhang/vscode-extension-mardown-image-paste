interface CdnUploader {
  upload(img: Buffer): Promise<String>;
}

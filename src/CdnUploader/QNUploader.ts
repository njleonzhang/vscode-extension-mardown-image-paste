
export class QNUploader implements CdnUploader {

  constructor() {

  }

  upload(img: Buffer): Promise<String> {
    return new Promise(resolve => {
      resolve('');
    });
  }
}

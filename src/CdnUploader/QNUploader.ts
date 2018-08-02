
import * as vscode from 'vscode';
import { guid } from '../tools';
const qiniu = require('qiniu');

export class QNUploader implements CdnUploader {
  mac: any;
  preUrl: string;
  bucket: string;
  ak: string;
  sk: string;

  constructor(config: vscode.WorkspaceConfiguration) {
    this.ak = config.get('qiniuAK') || '';
    this.sk = config.get('qiniuSK') || '';
    this.bucket = config.get('qiniuBucket') || '';
    this.mac = new qiniu.auth.digest.Mac(this.ak, this.sk);
    this.preUrl = config.get('qiniuPreUrl') || '';
  }

  getToken(bucket: string, key: string): string {
    var putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket + ":" + key
    });

    return putPolicy.uploadToken(this.mac);
  }

  upload(asset: Buffer): Promise<String> {
    return new Promise((resolve, reject) => {
      if (!this.bucket || !this.preUrl || !this.ak || !this.sk) {
        vscode.window.showWarningMessage('qiniu cdn is not set correctly.');
        reject();
      }

      let key = guid();
      // generate token every time so that the token will not out of date.
      let token = this.getToken(this.bucket, key);

      let config = new qiniu.conf.Config();
      config.zone = qiniu.zone.Zone_z0;
      let formUploader = new qiniu.form_up.FormUploader(config);

      formUploader.put(token, key, asset, null, (respErr: any,
        respBody: any, respInfo: any) => {
        if (respErr) {
          console.log(respErr);
          reject(respErr);
        }

        if (respInfo.statusCode === 200) {
          console.log(respBody);
          resolve(`${this.preUrl.endsWith('/') ? this.preUrl + respBody.key : this.preUrl + '/' + respBody.key}`);
        } else {
          console.log(respInfo.statusCode);
          reject(respBody);
        }
      });
    });
  }
}


import * as vscode from 'vscode';
const qiniu = require('qiniu');

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const bucket = 'leon-blog-assets';

export class QNUploader implements CdnUploader {
  mac: any;
  preUrl: String;

  constructor(config: vscode.WorkspaceConfiguration) {
    let ak = config.get('qiniuAK') || '';
    let sk = config.get('qiniuSK') || '';
    this.mac = new qiniu.auth.digest.Mac(ak, sk);
    this.preUrl = config.get('qiniuPreUrl') || '';
  }

  getToken(bucket: String, key: String): String {
    var putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket + ":" + key
    });

    return putPolicy.uploadToken(this.mac);
  }

  upload(asset: any): Promise<String> {
    return new Promise((resolve, reject) => {
      let key = guid();
      let token = this.getToken(bucket, key);

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

import * as vscode from 'vscode';
import axios, { AxiosRequestConfig } from 'axios';
let FormData = require('form-data');

export class SMUploader implements CdnUploader {
  upload(asset: Buffer): Promise<String> {
    let form = new FormData();
    form.append('smfile', asset, 'test.png');

    let options: AxiosRequestConfig = {
      method: 'POST',
      url: `https://sm.ms/api/upload`,
      headers: { 'Content-Type': form.getHeaders()['content-type'] },
      data: form,
    };

    return axios.request(options).then((response: any) => {
      let data = response.data;
      if (data.code === 'success') {
        return data.data.url;
      }
      throw {
        message: `error! status: ${data.code}, message: ${(data.msg) || ''}`
      };
    }).catch(error => {
      vscode.window.showWarningMessage(error.message);
      throw error;
    });
  }
}

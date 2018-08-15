import * as vscode from 'vscode';
import { guid, getTimeString } from '../tools';
import axios, { AxiosRequestConfig } from 'axios';
const sha1 = require('sha1');
const tunnel = require('tunnel');

export class GithubUploader implements CdnUploader {
  githubApi: any;
  folder: string;
  owner: string;
  proxy: string;
  token: string;
  repo: string;
  tunnel: any;
  proxyProtocol: string = '';
  proxyHost: string = '';
  proxyPort: number = 0;
  timeout: number;

  constructor(config: vscode.WorkspaceConfiguration) {
    let fullRepo: string = config.get('githubRepo') || '';
    let [owner, repo] = fullRepo.split('/');
    this.token = config.get('githubAccessToken') || '';
    this.owner = owner;
    this.repo = repo;
    this.folder = config.get('githubAssetFolder') || 'assets';
    this.proxy = config.get('proxy') || '';
    this.timeout = config.get('githubTimeOut') || 10000;

    if (this.proxy) {
      let proxyItems = this.proxy.split('//');
      this.proxyProtocol = proxyItems[0].slice(0, -1);
      let [proxyHost, proxyPort] = proxyItems[1].split(':');
      this.proxyHost = proxyHost;
      this.proxyPort = parseInt(proxyPort);

      if (this.proxyProtocol === 'http') {
        // jan-molak's solution for https over http proxy
        // in https://github.com/axios/axios/issues/925
        this.tunnel = tunnel.httpsOverHttp({
          proxy: {
            host: this.proxyHost,
            port: this.proxyPort,
          },
        });
      }
    }
  }

  upload(asset: Buffer): Promise<String> {
    let fileName = `${this.folder}/${guid()}.png`;
    let content = asset.toString('base64');

    let options: AxiosRequestConfig = {
      method: 'PUT',
      url: `https://api.github.com:443/repos/${this.owner}/${this.repo}/contents/${fileName}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${this.token}`
      },
      data: {
        message: `upload image at ${getTimeString()}`,
        content,
        sha: sha1(content)
      },
      proxy: ((this.proxyProtocol === 'https') ? {
        host: this.proxyHost,
        port: this.proxyPort
      } : false),
      httpsAgent: this.tunnel,
      timeout: this.timeout
    };

    return axios.request(options).then((response: any) => {
      if (response.status === 201) {
        return `https://cdn.rawgit.com/${this.owner}/${this.repo}/master/${fileName}`;
      }
      throw {
        message: `error! status: ${response.status}, message: ${(response.headers && response.headers.status) || ''}`
      };
    }).catch(error => {
      vscode.window.showWarningMessage(error.message);
      throw error;
    });
  }
}

import * as vscode from 'vscode';
import { guid, getTimeString } from '../tools';
const GithubApi = require('@octokit/rest');
// const HttpProxyAgent = require('http-proxy-agent');

export class GithubUploader implements CdnUploader {
  ghrepo: any;
  githubApi: any;
  folder: string;
  owner: string;
  repo: string;
  proxy: string;

  constructor(config: vscode.WorkspaceConfiguration) {
    const token = config.get('githubAccessToken') || '';
    let fullRepo: string = config.get('githubRepo') || '';
    let [owner, repo] = fullRepo.split('/');
    this.owner = owner;
    this.repo = repo;
    this.folder = config.get('githubAssetFolder') || 'assets';
    this.proxy = config.get('proxy') || '';

    this.githubApi = GithubApi({
      // agent: new HttpProxyAgent(this.proxy)
    });

    this.githubApi.authenticate({
      type: 'token',
      token
    });
  }

  upload(asset: Buffer): Promise<String> {
    let fileName = `${this.folder}/${guid()}.png`;

    return this.githubApi.repos.createFile({
      owner: this.owner,
      repo: this.repo,
      path: fileName,
      message: `upload image at ${getTimeString()}`,
      content: asset.toString('base64')
    }).then((result: any) => {
      if (result.status === 201) {
        return `https://cdn.rawgit.com/${this.owner}/${this.repo}/master/${fileName}`;
      } else {
        throw result.headers.status || result.status || `unknow error`;
      }
    }).catch((error: any) => {
      vscode.window.showWarningMessage(error);
      throw error;
    });
  }
}

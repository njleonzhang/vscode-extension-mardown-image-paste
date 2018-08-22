import { QNUploader } from './QNUploader';
import { GithubUploader } from './GithubUploader'
import { CloudinaryUploader } from './CloudinaryUploader';
import * as vscode from 'vscode';

export function createCdnUploader(type: String, config: vscode.WorkspaceConfiguration): CdnUploader | null {
  switch(type) {
    case 'qiniu':
      return new QNUploader(config);

    case 'github':
      return new GithubUploader(config);

    case 'cloudinary':
      return new CloudinaryUploader(config);

    default:
      return null;
  }
}

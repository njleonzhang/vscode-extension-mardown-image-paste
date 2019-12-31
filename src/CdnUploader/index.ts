import { QNUploader } from './QNUploader';
import { GithubUploader } from './GithubUploader'
import { CloudinaryUploader } from './CloudinaryUploader';
import * as vscode from 'vscode';
import { SMUploader } from './SMUploader';
import { S3Uploader } from './S3Uploader';

export function createCdnUploader(type: String, config: vscode.WorkspaceConfiguration): CdnUploader | null {
  switch(type) {
    case 'qiniu':
      return new QNUploader(config);

    case 'github':
      return new GithubUploader(config);

    case 'cloudinary':
      return new CloudinaryUploader(config);

    case 'sm':
      return new SMUploader();

    case 's3':
      return new S3Uploader(config);

    default:
      return null;
  }
}

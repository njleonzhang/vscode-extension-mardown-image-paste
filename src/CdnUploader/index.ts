import { QNUploader } from './QNUploader';
import * as vscode from 'vscode';

export function createCdnUploader(type: String, config: vscode.WorkspaceConfiguration): CdnUploader | null {
  switch(type) {
    case 'qiniu':
      return new QNUploader(config);

    default:
      return null;
  }
}

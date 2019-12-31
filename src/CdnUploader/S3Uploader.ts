import * as vscode from 'vscode';
import { guid } from '../tools';
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
const fileType = require('file-type');

export class S3Uploader implements CdnUploader {

    preUrl: string;
    bucket: string;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.bucket = config.get('s3Bucket') || '';
        this.preUrl = config.get('s3PreUrl') || '';
    }

    upload(asset: Buffer): Promise<String> {
        return new Promise((resolve, reject) => {
            if (!this.bucket || !this.preUrl) {
                vscode.window.showWarningMessage('s3 cdn is not set correctly.');
                reject();
            }
            let ft = fileType(asset);
            let key = guid() + "." + ft.ext;
            let params = { Bucket: this.bucket, Key: key, ContentType: ft.mime, Body: asset, ACL: 'public-read' };
            s3.putObject(params, (err: any, data: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(data);
                    resolve(`${this.preUrl.endsWith('/') ? this.preUrl + key : this.preUrl + '/' + key}`);
                }
            });
        });
    }
}
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import tinify from 'tinify';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import * as Constant from './const';

const ipc = require('node-ipc');

// let imagePath = vscode.workspace.getConfiguration('pasteImage')['iamgePath'];
let imagePath = '/Users/leon/Documents/git/markdown-image-paste/tmpPicture.png';
let electron: ChildProcess;
tinify.key = 's2ox1BVKJ2BrT8CmYZqZSEBBsebt62vh'; // the key is assigned to property _key

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "markdown-image-paste" is now active!');

    // The code you place here will be executed every time your command is executed
    let scriptPath = path.join(__dirname, './clipboard.js');
    let electronPath = path.join(__dirname, '../node_modules/.bin/electron');

    var spawn_env = JSON.parse(JSON.stringify(process.env));

    delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    delete spawn_env.ELECTRON_RUN_AS_NODE;

    electron = spawn(electronPath, [scriptPath, scriptPath], {
        env: spawn_env,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    // start the ipc server
    ipc.config.id = Constant.parentIpcId;
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    let ipcChannel: any;
    ipc.connectTo(Constant.childIpcId, () => {
        ipcChannel = ipc.of[Constant.childIpcId];

        ipcChannel.on('connect', () => {
            // the first time invoke this plugin
            ipcChannel.emit(Constant.msg_getClipboardContent, '');
        });

        ipcChannel.on(Constant.msg_resClipboardContent, (data: any) => {
            let buffer = new Buffer(data.data);
            if ((tinify as any)._key) {
                tinify.fromBuffer(buffer).toFile('/Users/leon/Documents/git/markdown-image-paste/optimized.png');
                console.log('It\'s optimized and saved!');
            } else {
                fs.writeFile('/Users/leon/Documents/git/markdown-image-paste/unOptimized.png', buffer, function (err: any) {
                    if (err) {
                        throw err;
                    }
                    console.log('It\'s saved!');
                });
            }
        });
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.markdownPasteImage', async () => {
        // trigger the process by send the get clipboard content message to electron process
        if (ipcChannel) {
            ipcChannel.emit(Constant.msg_getClipboardContent);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    ipc.disconnect(Constant.childIpcId);
    electron.kill();
}

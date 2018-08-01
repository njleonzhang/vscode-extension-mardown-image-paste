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

let electron: ChildProcess;
tinify.key = vscode.workspace.getConfiguration('tinyPngKey'); // the key is assigned to property _key

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "markdown-image-paste" is now active!');

    // The code you place here will be executed every time your command is executed
    let scriptPath = path.join(__dirname, './clipboard.js');
    let electronPath = path.join(__dirname, '../node_modules/.bin/electron');

    var spawn_env = JSON.parse(JSON.stringify(process.env));

    // start electron in non-node model, otherwise, the electron api can not be used.
    delete spawn_env.ATOM_SHELL_INTERNAL_RUN_AS_NODE;
    delete spawn_env.ELECTRON_RUN_AS_NODE;

    electron = spawn(electronPath, [scriptPath, scriptPath], {
        env: spawn_env,
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    // connect to the ipc server started by electron process
    ipc.config.id = Constant.parentIpcId;
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    let ipcChannel: any;
    ipc.connectTo(Constant.childIpcId, () => {
        ipcChannel = ipc.of[Constant.childIpcId];

        ipcChannel.on('connect', () => {
            // the first time invoke this plugin, the icp is not connected,
            // ipcChannel is not initialized, so we trigger the message here.
            ipcChannel.emit(Constant.msg_getClipboardContent, '');
        });

        ipcChannel.on(Constant.msg_resClipboardContent, (data: any) => {
            let buffer = new Buffer(data.data);

            if (!data || !data.data || !data.data.length) {
                return vscode.window.showWarningMessage('Please copy a picture to clipboard for paste!');
            }

            if ((tinify as any)._key) {
                // if tinify key is set, we leverage the tool to optimize the picture.
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

            insertImageToMd();
        });
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.markdownPasteImage', async () => {
        // except of the first time the plugin is loaded, ipcChannel should be initialized.
        if (ipcChannel) {
            ipcChannel.emit(Constant.msg_getClipboardContent);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    // disconnect ipc and kill the electron process
    ipc.disconnect(Constant.childIpcId);
    electron.kill();
}

function insertImageToMd() {
    let editor = vscode.window.activeTextEditor;
    editor.edit((edit: any) => {
        let current = editor.selection;

        if (current.isEmpty) {
            edit.insert(current.start, '![](12341234)');
        } else {
            edit.replace(current, '![](12341234)');
        }
    });
}

import * as Constant from './const';
const { clipboard } = require('electron');
const ipc = require('node-ipc');

// start electron ipc server
ipc.config.id = Constant.childIpcId;
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.serve(() => {
  ipc.server.on(Constant.msg_getClipboardContent, (data: any, socket: any) => {
    let image = clipboard.readImage();
    let buffer = image.toPNG();
    ipc.server.emit(socket, Constant.msg_resClipboardContent, buffer);
  });
});

ipc.server.start();

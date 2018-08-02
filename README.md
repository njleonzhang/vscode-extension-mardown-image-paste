# vscode-extension-mardown-image-paste

A command to read the image from system clipborad, optimize the size, upload to CDN, and return you the CDN link. Support jpg, png, pdf....

![](https://user-images.githubusercontent.com/13174059/43577232-e3e2d1f0-967d-11e8-8de8-c844aa0b93dd.gif)

> can only work in dev mode due to [the vscode bug](https://github.com/Microsoft/vscode/issues/55631#issuecomment-409874534)

## How?

![](http://pcs7p33sr.bkt.clouddn.com/ca429c26-b378-aece-9ffa-050a3b945f49)

* The extension spawn a electron process for read image in clipborad via electron api `clipboard.readImage`.
* extension thread communicate with electron process via [node-ipc](https://github.com/RIAEvangelist/node-ipc).
* send the image to [tinyPng](https://tinypng.com/) for size optimization.
* send the image to CDN for hosting

## Extension Settings

| Setting | type | default | desc |
| -- | -- | -- | --|
| markdownPasteImage.tinyPngKey | string | '' | the tiny png developer key, refer to the [doc](https://tinypng.com/developers) |
| markdownPasteImage.cdnType | string | "qiniu" |  cdn type, currently only support qiniu |
| markdownPasteImage.qiniuBucket | string | "" | qiniu cdn's bucket name |
| markdownPasteImage.qiniuAK | string | "" | qiniu cdn's access key |
| markdownPasteImage.qiniuSK | string | "" | qiniu cdn's security key |
| markdownPasteImage.qiniuPreUrl | string | "" | qiniu cdn's pre-url  |

## PR welcomed
1. support more platforms
2. support more CDN，refer to [current code](https://github.com/njleonzhang/vscode-extension-mardown-image-paste/blob/master/src/CdnUploader/)

## Development
Clone the porject, and open it in vscode. press `F5` to start debug mode after `npm install the dependency`. At last, run `npm run package` to package a extension `vsix` file, and install it to your vscode for test.

## Limitations
1. extension size is big, because we need bundle electron in the package
2. the extension starts a long live electron process as a `ipc` server
3. only support mac os currently, should be easy to support other platform, PR welcomed
4. only support [qiniu](https://www.qiniu.com/en) CDN, should be easy support others, such as Amozon S3 and Azure storage, PR welcomed.
5. can not support `gif` due to the [limitation of electron api](https://github.com/electron/electron/issues/8485)

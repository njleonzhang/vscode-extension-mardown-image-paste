# vscode-extension-mardown-image-paste

A command to read the image from system clipborad, optimize the size, upload to CDN, and return you the CDN link. Support jpg, png, pdf....

> Chinese blog introducing this extension: http://www.njleonzhang.com/2018/08/14/vs-code-paste-image.html

![](https://user-images.githubusercontent.com/13174059/43623851-146acf7e-9716-11e8-83b9-6fc68bcce2e0.gif)

## How?

![vscode-plugin-deep](https://user-images.githubusercontent.com/13174059/43622590-7e58580e-970f-11e8-8edd-06b97ffedf49.png)

* The extension spawn a electron process for read image in clipborad via electron api `clipboard.readImage`.
* extension process communicate with electron process via [node-ipc](https://github.com/RIAEvangelist/node-ipc).
* send the image to [tinyPng](https://tinypng.com/) for size optimization.
* send the image to CDN for hosting

## Installation
* Install this extension. (search by name `markdown image paste`  in vscode extension store)
* Install the electron ipc server app.
  ```
    npm install -g electron-image-ipc-server
  ```

  You can start the electron ipc server manually by command `eiis`

## Supported CDN Comparison

| CDN | Advantage | Disadvantage |
|-- |-- | -- |
| [qiniu](https://www.qiniu.com/prices) | totally 10G free storage; monthly 1 million times free viewing; fast net access globally; big and stable company in China | need filing domain approved by China goverment for accessibility 😂 |
| github | based on github, little limitation if you follow the [terms of service](https://help.github.com/articles/github-terms-of-service/) and [github pages limits](https://help.github.com/articles/what-is-github-pages/#usage-limits); great and stable company | access is slow in China |
| [cloudinary](https://cloudinary.com/pricing) | totally 10G free storage for at most 300K items, 20 GB free monthly net viewing bandwith, fast net access globally | a small and unstable company? (not sure) |
| [sm.ms](https://sm.ms/) | No limitation, fast access in China | no account, and you can not manage your picture, private projects |

> This extension is made originally for writing my personal [techblog](https://www.njleonzhang.com/), which means the storage and network access cost to the CDN should be small. You should not use this extension to upload pitures with mass access to `github`, which may exceed [github pages limits](https://help.github.com/articles/what-is-github-pages/#usage-limits).

## Extension Settings

| Setting | type | default | desc |
| -- | -- | -- | --|
| markdownPasteImage.cdnType | string | "github" |  cdn type, currently support [qiniu](https://www.qiniu.com/), github, [cloudinary](https://cloudinary.com/), [sm](https://sm.ms/) |
| markdownPasteImage.tinyPngKey | string | '' | the tiny png developer key, refer to the [doc](https://tinypng.com/developers), if not provided, the optimization is skipped |
| markdownPasteImage.qiniuBucket | string | "" | qiniu cdn's bucket name |
| markdownPasteImage.qiniuAK | string | "" | qiniu cdn's access key |
| markdownPasteImage.qiniuSK | string | "" | qiniu cdn's security key |
| markdownPasteImage.qiniuPreUrl | string | "" | qiniu cdn's pre-url  |
| markdownPasteImage.githubAccessToken | string | "" | the github access token, created in [github](https://github.com/settings/tokens) with all privilege of `repo` scope |
| markdownPasteImage.githubRepo | string | "" | github repository to store your images, example: [njleonzhang/image-bed](https://github.com/njleonzhang/image-bed) |
| markdownPasteImage.githubAssetFolder | string | "" | asset folder of your image bed github repository  |
| markdownPasteImage.proxy | string | "" | proxy for github api, for exmaple: http://127.0.0.1:1087 |
| markdownPasteImage.githubTimeOut | number | 10000 | github api is slow in china, here you can set timeout according to you network. 10s as default |
| markdownPasteImage.cloudinaryName | string | "" | cloud name of cloudinary |
| markdownPasteImage.cloudinaryApiKey | string | "" | api key of cloudinary |
| markdownPasteImage.cloudinarySecret | string | "" | api secret of cloudinary |
| markdownPasteImage.cloudinaryFolder | string | "" | folder of cloudinary you want to put your image in |

> if cdn is not configured correctly or the editing file is not a markdown file, the picture will be paste to current folder of the editing file.

> if you use github as cdn in China, I suggest you config a proxy.

| command | name | desc |
| -- | -- | -- |
| extension.markdownPasteImage | Paste Image | paste the clipbord image to cdn |
| extension.markdownPasteImage.reInit | Paste Image: Reinit | restart and reconnect to electron app which act as ipc server |

## PR welcomed
* support more CDN, such as Amozon S3 and Azure storage, refer to [current code](https://github.com/njleonzhang/vscode-extension-mardown-image-paste/blob/master/src/CdnUploader/)

## Development
Clone the porject, and open it in vscode. press `F5` to start debug mode after `npm install the dependency`. At last, run `npm run package` to package a extension `vsix` file, and install it to your vscode for test.

## Limitations
1. need to install a extra node module, [electron-image-ipc-server](https://github.com/njleonzhang/electron-image-ipc-server). if we bundle the electron in the extension, the extension size will be more than 70M. `electron-image-ipc-server` is started as a long live electron process by the extension.
2. can not support `gif` due to the [limitation of electron api](https://github.com/electron/electron/issues/8485)

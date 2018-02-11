# Multer Azure Storage

Multer Azure Storage provides a Storage for [multer](https://github.com/expressjs/multer) allowing for saving data to Blob Storage.

## Installation

```shell
npm install multer-azure-storage
```

or

```shell
yarn add multer-azure-storage
```

## Usage

Basic usage example:

```javascript
var multer = require('multer')
var MulterAzureStorage = require('multer-azure-storage')
var upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=mykey;EndpointSuffix=core.windows.net',
    containerName: 'photos',
    containerSecurity: 'blob'
  })
})
```

Then use `upload` as described in [multer documentation](https://github.com/expressjs/multer)

### File information

Each file added using Multer Azure Storage contains the following information:

Key | Description | Note
---|---|---
`fieldname` | Field name specified in the form | added by multer
`originalname` | Name of the file on the user's computer | added by multer
`encoding` | Encoding type of the file | added by multer
`mimetype` | Mime type of the file | added by multer
`blob` | Name of created blob |
`container` | Name of container in which blob was created |
`blobType` | Type of blob | BlockBlob -  From the result of call to azure's `getBlobProperties()` of `blobService`
`size` | Size of the blob | From the result of call to azure's `getBlobProperties()` of `blobService`
`etag` | Etag | From the result of call to azure's `getBlobProperties()` of `blobService`
`metadata` | Blob's metadata | From the result of call to azure's `getBlobProperties()` of `blobService`
`url` | Url to access the blob |

## Options

To setup the connection to Azure Storage either the connection string (`azureStorageConnectionString`) is required or the combination of storage account (`azureStorageAccount`) and access key (`azureStorageAccessKey`)

### Using Azure storage connection string

| Parameter Name | Type | Sample Value |
|---|---|---|
| `azureStorageConnectionString` | string | `'DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=mykey;EndpointSuffix=core.windows.net'` |
| `containerName` | string | `'photos'` |
| `containerSecurity` | string (optional) | `'blob'` or `'container'`, defaults to blob |
| `fileName` | function (optional) | function that receives a file reference and allows customization of the file name |

### Using Azure storage account name and access key

| Parameter Name | Type | Sample Value |
|---|---|---|
| `azureStorageAccessKey` | string | `'dcs@3asd@...'` - Access Key related to your storage account |
| `azureStorageAccount` | string | `'mystorageaccount'` |
| `containerName` | string | `'photos'` |
| `containerSecurity` | string (optional) | `'blob'` or `'container`', defaults to blob |
| `fileName` | function (optional) | function that receives a file reference and allows customization of the file name |

For more information about the meaning of individual parameters please check [Azure documentation](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-blob-storage/) on node.js integration.

## Tests

Not implemented yet

## License

[MIT](LICENSE)

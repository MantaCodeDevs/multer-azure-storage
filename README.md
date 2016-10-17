# Multer Azure Storage

Multer Azure Storage provides a Storage for [multer](https://github.com/expressjs/multer) allowing for saving data to Blob Storage.

## Usage
TODO

## Options
| Parameter Name | Type | Sample Value |
|---|---|---|
| azureStorageConnectionString | string | 'https://mystorageaccount.blob.core.windows.net/ |
| azureStorageAccessKey | string | 'dcs@3asd@...' - Access Key related to your storage account |
| azureStorageAccount | string | 'mystorageaccount' |
| containerName | string | 'photos' |
| containerSecurity | string (optional) | 'blob' or 'container', defaults to blob |

For more information about the meaning of individual parameters please check [Azure documentation](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-blob-storage/) on node.js integration.

## Tests
Not implemented yet

## License

[MIT](LICENSE)

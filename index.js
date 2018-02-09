"use strict"
let azure = require('azure-storage'),
    path = require('path'),
    uuid = require('node-uuid')

let _requestsQueue = []

const blobName = (file) => {
    let name = file.fieldname + '-' + uuid.v4() + path.extname(file.originalname)
    file.blobName = name
    return name
}

const defaultSecurity = 'blob'

class MulterAzureStorage {

    constructor (opts) {
        this.containerCreated = false
        this.containerError = false

        let missingParameters = []
        if (!opts.azureStorageConnectionString) missingParameters.push("azureStorageConnectionString")
        if (!opts.azureStorageAccessKey) missingParameters.push("azureStorageAccessKey")
        if (!opts.azureStorageAccount) missingParameters.push("azureStorageAccount")
        if (!opts.containerName) missingParameters.push("containerName")

        if (missingParameters.length > 0) {
          throw new Error('Missing required parameter' + (missingParameters.length > 1 ? 's' : '') + ' from the options of MulterAzureStorage: ' + missingParameters.join(', '))
        }

        this.containerName = opts.containerName

        this.fileName = opts.fileName

        this.blobService = azure.createBlobService(
            opts.azureStorageAccount,
            opts.azureStorageAccessKey,
            opts.azureStorageConnectionString)

        let security = opts.containerSecurity || defaultSecurity

        if(!opts.dontCreateContainer)
        {
            this.blobService.createContainerIfNotExists(this.containerName, { publicAccessLevel : security }, (err, result, response) => {
                if (err) {
                    this.containerError = true
                    throw new Error('Cannot use container. Check if provided options are correct.')
                }
    
                this.containerCreated = true
    
                _requestsQueue.forEach(i => this._removeFile(i.req, i.file, i.cb))
                _requestsQueue = []
            })
        }
        else{
            this.containerCreated = true
        }

        
    }

    _handleFile(req, file, cb) {
        if (this.containerError) {
            cb(new Error('Cannot use container. Check if provided options are correct.'))
        }

        if (!this.containerCreated) {
            _requestsQueue.push({ req: req, file: file, cb: cb })
            return
        }

        const blob = (!this.fileName)? blobName(file): this.fileName
        console.log(blob);
        file.stream.pipe(this.blobService.createWriteStreamToBlockBlob(
          this.containerName,
          blob,
          /* options - see https://azure.github.io/azure-storage-node/BlobService.html#createWriteStreamToBlockBlob__anchor */
          {
              contentSettings: {contentType: file.mimetype}
          },
          (err, azureBlob) => {
            if (err) {
                return cb(err)
            }

            this.blobService.getBlobProperties(this.containerName, blob, (err, result, response) => {
                if (err) {
                    return cb(err)
                }

                const url = this.blobService.getUrl(this.containerName, blob)
                console.log(url);
                cb(null, {
                    container: result.container,
                    blob: blob,
                    blobType: result.blobType,
                    size: result.contentLength,
                    etag: result.etag,
                    metadata: result.metadata,
                    url: url
                })
            })
        }))
    }

    _removeFile(req, file, cb) {
        if (this.containerError) {
            cb(new Error('Cannot use container. Check if provided options are correct.'))
        }

        if (file.blobName) {
            this.blobService.deleteBlob(this.containerName, file.blobName, cb)
        } else {
            cb(null)
        }
    }
}

/**
 * @param {object}      [opts]
 * @param {string}      [opts.azureStorageConnectionString]
 * @param {string}      [opts.azureStorageAccessKey]
 * @param {string}      [opts.azureStorageAccount]
 * @param {string}      [opts.containerName]
 * @param {string}      [opts.containerSecurity]                'blob' or 'container', default: blob
 * @param {function}    [opts.fileName]     function that given a file will return the name to be used as the file's name
 */
module.exports = function (opts) {
    return new MulterAzureStorage(opts)
}

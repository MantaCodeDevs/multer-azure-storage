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

class MulterAzureStorage {

    constructor (opts) {
        this.containerCreated = false
        this.containerError = false

        if (!opts.azureStorageConnectionString || !opts.azureStorageAccessKey || !opts.azureStorageAccount) {
            throw new Error('Missing options')
        }

        this.containerName = opts.containerName || uuid.v4()

        this.blobService = azure.createBlobService(
            opts.azureStorageAccount,
            opts.azureStorageAccessKey,
            opts.azureStorageConnectionString)

        this.blobService.createContainerIfNotExists(this.containerName, { publicAccessLevel : 'blob' }, (err, result, response) => {
            if (err) {
                this.containerError = true
                throw new Error('Cannot use container. Check if provided options are correct.')
            }

            this.containerCreated = true

            _requestsQueue.forEach(i => this._removeFile(i.req, i.file, i.cb))
            _requestsQueue = []
        })
    }

    _handleFile(req, file, cb) {
        if (this.containerError) {
            cb(new Error('Cannot use container. Check if provided options are correct.'))
        }

        if (!this.containerCreated) {
            _requestsQueue.push({ req: req, file: file, cb: cb })
            return
        }

        const blob = blobName(file)
        file.stream.pipe(this.blobService.createWriteStreamToBlockBlob(this.containerName, blob, (err, azureBlob) => {
            if (err) {
                return cb(err)
            }

            this.blobService.getBlobProperties(this.containerName, blob, (err, result, response) => {
                if (err) {
                    return cb(err)
                }

                const url = this.blobService.getUrl(this.containerName, blob)
                cb(null, {
                    container: result.container,
                    blob: result.blob,
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
 */
module.exports = function (opts) {
    return new MulterAzureStorage(opts)
}

(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.factory('DownloadFactory', ['$rootScope', '$window', 'AsperaTransfer', function ($rootScope, $window, AsperaTransfer) {
        var downloads = {
            currentDownloads: [],
            assetsToTransfer: []
        };

        downloads.getCurrentTransfers = function () {
            return downloads.currentDownloads;
        };

        downloads.addAssetToTransfer = function (asset) {
            if (!_.contains(downloads.currentDownloads, asset) &&
                !_.contains(downloads.assetsToTransfer, asset)) {
                downloads.assetsToTransfer.push(asset);
            }
        };

        downloads.clearAssetsToTransfer = function () {
            downloads.assetsToTransfer.splice(0, downloads.assetsToTransfer.length);
        };

        downloads.clearCurrentDownloads = function () {
            downloads.currentDownloads = [];
        };

        downloads.clearCompletedTransfers = function () {
            for (var i = downloads.currentDownloads.length - 1; i >= 0; i--) {
                if (downloads.currentDownloads[i].transfer.status === 'completed' || downloads.currentDownloads[i].transfer.status === 'removed') {
                    downloads.currentDownloads.splice(i, 1);
                }
            }
        };

        downloads.getAssetToTransfer = function () {
            return downloads.assetsToTransfer;
        };

        downloads.isTransferSessionFailed = function () {
            var currentTransfers = downloads.currentDownloads;
            var countFailed = 0;
            _.each(currentTransfers, function (assetTransfer) {
                var status = assetTransfer.transfer.status;
                if (status === 'failed') {
                    countFailed++;
                }
            });
            if (currentTransfers.length === countFailed) {
                return true;
            } else {
                return false;
            }
        };

        downloads.moveToDownload = function () {
            _.each(downloads.assetsToTransfer, function (asset) {
                if (asset.permissions.export) {
                    downloads.currentDownloads.push(asset);
                }
            });

            downloads.clearAssetsToTransfer();
        };

        downloads.processDownload = function (xmlChecked) {
            // remove assets that are not selected from either source or prview or xml to download.
            for (var i = downloads.assetsToTransfer.length - 1; i >= 0; i--) {
                if (downloads.assetsToTransfer[i].sourceChecked === false &&
                    downloads.assetsToTransfer[i].previewChecked === false) {
                    downloads.assetsToTransfer.splice(i, 1);
                }
            }

            _.each(downloads.assetsToTransfer, function (asset) {
                asset.transfer = {
                    progress: ' - ',
                    status: 'queued',
                    timeRemaining: '',
                    bytes_expected: 0,
                    bytes_written: 0,
                    calculated_rate_kbps: 0,
                    target_title: ''
                }
            });

            var request = AsperaTransfer.getAssetDownloadPlugin(downloads.assetsToTransfer, xmlChecked);
            request.success(function (result) {
                $('#downloadPlugin').html(result.code);
                $window.fileControls.selectFolder();
            });

            request.error(function (errorMessage) {
                $rootScope.$broadcast('downloadsServiceError', errorMessage);
            });
        };

        downloads.cancelDownload = function () {
            var request = AsperaTransfer.processCancelDownload();
        };

        downloads.showContainingFolder = function (uuid) {
            AsperaTransfer.showContainingFolder(uuid);
        }

        downloads.clearAssetsCompletedInPlugin = function () {
            AsperaTransfer.clearListCompleted();
        }

        return downloads;
    }]);
})();
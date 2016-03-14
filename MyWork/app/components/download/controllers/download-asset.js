(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.controller('DownloadCtrl', ['$rootScope', '$scope', '$analytics', 'assets', 'closeDialog', 'DownloadFactory', 'LabelService', 'OverallProgress', 'paneManager', 'SessionService', 'reopened',
    function ($rootScope, $scope, $analytics, assets, closeDialog, DownloadFactory, LabelService, OverallProgress, paneManager, SessionService, reopened) {

        $scope.isAsperaLoading = true;

        var init = function () {

            ASPERAINSTALLER.initInstallCheckup().then(function () {
                $scope.isAsperaLoading = false;

                if (!reopened) {
                    DownloadFactory.clearCompletedTransfers();
                }

                if (assets) {
                    _.each(assets, function (asset) {

                        DownloadFactory.addAssetToTransfer(asset);
                        asset.sourceChecked = true;
                        asset.previewChecked = false;
                        asset.showMore = false;

                    });
                }

                load();
            });
        };

        var load = function () {
            if (!hasActiveTransfers(DownloadFactory.getCurrentTransfers()) && !reopened) {
                DownloadFactory.clearCurrentDownloads();
            }

            $scope.isLoading = false;
            $scope.isDisabled = false;
            $scope.hasError = false;
          
            $scope.currentDownloads = DownloadFactory.getCurrentTransfers();
            $scope.assetsToTransfer = DownloadFactory.getAssetToTransfer();

            $scope.downloadLabels = LabelService.getDownloadLabels($scope.clientUser, $scope.assetsToTransfer);

            $scope.overallProgress = 0;
            $scope.overallTimeRemaining = 0;
            $scope.overallBytes_expected = 0;
            $scope.overallBytes_written = 0;
            $scope.downloadButtonText = 'Start Download';
            $scope.downloadFinished = false;

            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        var mOnstart = SessionService.get('minimize-on-start', true);

        $scope.minimizeOnStart = {
            value: mOnstart
        };

        $scope.$watch('minimizeOnStart.value', function (newVal) {
            SessionService.set('minimize-on-start', newVal);
        }, true);

        var isXmlChecked = SessionService.get('xml-checked', false);
        $scope.xmlChecked = {
            value: isXmlChecked
        };
        $scope.$watch('xmlChecked.value', function (newVal) {
            SessionService.set('xml-checked', newVal);
        }, true);

        $scope.$on('downloadsFolderSelected', function (event, newObj) {

            $analytics.eventTrack('Select Download Folder', { category: 'Download' });
            if (newObj) {
                DownloadFactory.moveToDownload();
                if ($scope.minimizeOnStart.value) {
                    $scope.minimizeFooter();
                }
            } else {
                closeDialog();
            }
            $scope.isLoading = false;
        });

        $scope.$on('downloadsServiceError', function (event, newObj) {
            $scope.showServiceError(newObj);
            $scope.isLoading = false;
        });

        $scope.showServiceError = function (error) {
            $scope.hasError = true;
            $scope.errorHeader = 'An unexpected error has occurred';
            $scope.serviceError = error;
            $scope.errorSuggest = 'Please, try again later. If the problem occurs again contact support.';
        };

        $scope.showRetryableError = function (error) {
            $scope.hasError = true;
            $scope.serviceError = error;
            $scope.errorHeader = 'Trying to Recover from error';
            $scope.errorSuggest = '';
        };

        var lastErrorRecorded = '';
        $scope.$on('broadcastTransferProgress', function (event, newObj) {

            if (newObj.status === 'failed') {
                $analytics.eventTrack('Failure', { category: 'Download' });
                $scope.showServiceError(newObj.error_desc);
                lastErrorRecorded = newObj.error_desc;
            }

            if (newObj.status === 'willretry') {
                $analytics.eventTrack('WillRetry', { category: 'Download' });
                $scope.showRetryableError(lastErrorRecorded);
            }

            if (newObj.status === 'initiating' && newObj.previous_status === 'willretry') {
                $scope.hasError = false;
            }

            var assetToUpdate = _.find($scope.currentDownloads, function (asset) {
                if (newObj.assetId !== undefined) {
                    if (asset.assetId === newObj.assetId) {
                        return asset;
                    }
                } else {
                    if (asset.transfer.target_title === newObj.title) {
                        return asset;
                    }
                }
            });

            if (assetToUpdate !== undefined) {
                assetToUpdate.transfer.progress = (newObj.percentage * 100);
                assetToUpdate.transfer.status = newObj.status;
                assetToUpdate.transfer.timeRemaining = (newObj.remaining_usec / 1000000);
                assetToUpdate.transfer.bytes_expected = newObj.bytes_expected;
                assetToUpdate.transfer.bytes_written = newObj.bytes_written;
                assetToUpdate.transfer.calculated_rate_kbps = newObj.calculated_rate_kbps;
            }

            var transferProgress = OverallProgress.calculate($scope.currentDownloads);

            $scope.overallProgress = transferProgress._overallProgress;
            $scope.overallTimeRemaining = transferProgress._overallTimeRemaining;
            $scope.overallBytes_expected = transferProgress._overallBytes_expected;
            $scope.overallBytes_written = transferProgress._overallBytes_written;


            _.defer(function () {
                $scope.$apply();
            });

        });

        var hasActiveTransfers = function (currentTransfers) {
            var hasActiveTransfers = false;
            _.each(currentTransfers, function (assetTransfer) {
                var status = assetTransfer.transfer.status;
                if (status === 'running' || status === 'initiating') {
                    hasActiveTransfers = true;
                }
            });
            return hasActiveTransfers;
        };

        var hasActiveOrFailedTransfers = function (currentTransfers) {
            var hasActiveTransfers = false;
            _.each(currentTransfers, function (assetTransfer) {
                var status = assetTransfer.transfer.status;
                if (status === 'running' || status === 'initiating' || status === 'failed') {
                    hasActiveTransfers = true;
                }
            });
            return hasActiveTransfers;
        };


        var hasCompletedTransfers = function (currentTransfers) {
            var hasActiveTransfers = false;
            _.each(currentTransfers, function (assetTransfer) {
                var status = assetTransfer.transfer.status;
                if (status === 'completed') {
                    hasActiveTransfers = true;
                }
            });
            return hasActiveTransfers;
        };

        $scope.selectAll = {
            source: true,
            preview: false
        };

        
        // For Source

        $scope.checkedSource = function () {

            if ($scope.selectAll.source) {
                _.each($scope.assetsToTransfer, function (asset) {
                    asset.sourceChecked = false;
                });

            } else {
                _.each($scope.assetsToTransfer, function (asset) {
                    asset.sourceChecked = true;
                });

            }
        };
      
       
        $scope.checked = function () {

            for (var i = 0; i < $scope.assetsToTransfer.length; i++) {
                 if (!$scope.assetsToTransfer[i].sourceChecked) {
                    $scope.selectAll.source = false;
                    return false;
                }
            }
           $scope.selectAll.source = true;
        }

    

        // for preview

        $scope.checkedPreview = function () {

            if ($scope.selectAll.preview) {
                _.each($scope.assetsToTransfer, function (asset) {
                    asset.previewChecked = false;
                });

            } else {
                _.each($scope.assetsToTransfer, function (asset) {
                    asset.previewChecked = true;
                });

            }
        };
        $scope.chekedAsset = function () {

            for (var i = 0; i < $scope.assetsToTransfer.length; i++) {
                if (!$scope.assetsToTransfer[i].previewChecked) {
                    $scope.selectAll.preview = false;
                    return false;
                }
            }
        
            $scope.selectAll.preview = true;
        }
           
        $scope.closeModal = function () {
            if ($scope.hasAssetsTransfering()) {
                paneManager.toggleIsDownloadMinimized(true);
            }

            $scope.isDisabled = false;
            closeDialog();
        };

        $scope.startDownload = function () {

            $scope.isDisabled = true;
            if ($scope.assetsToTransfer.length < 1 && $scope.downloadButtonText === 'Download Complete!') {
                closeDialog();
            } else {
                $scope.isLoading = true;
                processAnalyticsStartDownload();
                DownloadFactory.processDownload($scope.xmlChecked.value);
            }
            $scope.initialDownload = false;
        };

        $scope.toggleShowMore = function (asset) {
            asset.showMore = !asset.showMore;
        };

        $scope.removeToTransfer = function (asset) {
            var index = $scope.assetsToTransfer.indexOf(asset);
            $scope.assetsToTransfer.splice(index, 1);
            if ($scope.assetsToTransfer.length < 1) {
                $scope.closeModal();
            }
        };

        $scope.cancelDownload = function () {
            $scope.isDisabled = false;
            $analytics.eventTrack('Cancel', { category: 'Download' });
            DownloadFactory.cancelDownload();
            closeDialog();
        };

        $scope.showContainingFolder = function (uuid) {
            DownloadFactory.showContainingFolder(uuid);
        };

        $scope.hasAssetsToTransfer = function () {
            var checkedSrc = _.filter($scope.assetsToTransfer, function (item) {
                return item.sourceChecked == true;
            });

            var checkedPrev = _.filter($scope.assetsToTransfer, function (item) {
                return item.previewChecked == true;
            });

            var canDownload = _.filter($scope.assetsToTransfer, function (item) {
                return item.permissions.export == true;
            });

            return $scope.assetsToTransfer.length > 0 && (checkedSrc.length > 0 || checkedPrev.length > 0) && canDownload.length > 0;
        };
        $scope.initialDownload = true;

        $scope.checkDisabledStart = function () {
            var disabled = false;
            var firstTimeOrReopened = $scope.initialDownload && !reopened;
            var transfersInProgress = hasActiveOrFailedTransfers(DownloadFactory.getCurrentTransfers()) || DownloadFactory.getAssetToTransfer().length > 0;
            var hasAssetsToTransfer = $scope.hasAssetsToTransfer();
            var completedTransfers = hasCompletedTransfers(DownloadFactory.getCurrentTransfers());


            if (!hasAssetsToTransfer && !completedTransfers) {
                return true;
            }

            if (firstTimeOrReopened) {
                return false;
            }

            if (transfersInProgress) {
                disabled = true;
            } else {
                disabled = false;
            }

            return disabled;
        }

        $scope.transfersComplete = function () {
            var count = 0;
            _.each($scope.currentDownloads, function (item) {
                if (item.transfer.status === 'completed') {
                    count += 1;
                }
            });

            if (count === $scope.currentDownloads.length) {
                return true;
            } else {
                return false;
            }
        }

        $scope.hasAssetsTransfering = function () {

            var count = 0;
            _.each($scope.currentDownloads, function (item) {
                //just for removed and completed items
                if (item.transfer.status === 'completed' || item.transfer.status === 'removed') {
                    count += 1;
                }
            });


            if (count === $scope.currentDownloads.length) {

                if ($scope.assetsToTransfer.length > 0) {
                    $scope.downloadButtonText = 'Start Download ';
                } else {
                    $scope.downloadButtonText = 'Download Complete';
                    $scope.downloadFinished = true;
                }

                return false;
            } else {
                if ($scope.assetsToTransfer.length > 0) {
                    $scope.downloadButtonText = 'Start Download ';
                } else {
                    $scope.downloadButtonText = 'Download In Progress';
                }
                return true;
            }
        };

        $scope.hasSource = function (asset) {
            if (!asset || !asset.permissions) {
                return false;
            }

            return asset.permissions.export;
        };

        $scope.ShowPreviewChecked = function () {

            var hasMultipleTransfers = $scope.assetsToTransfer.length > 1;

            /* If at least one asset has a preview, show checkbox */
            var isAllItemsHavePreview = false;
            _.each($scope.assetsToTransfer, function (asset) {
                isAllItemsHavePreview = isAllItemsHavePreview || $scope.hasPreview(asset);
            });

            return hasMultipleTransfers && isAllItemsHavePreview;

        };

        var hasVideoPreviewHelper = function (asset) {

            var allowedFileExtensions = ['3gp', 'avi', 'wmv', 'flv', 'mp4', 'mov', 'mpeg', 'mpg'];
            var hasPreviewExtension = _.contains(allowedFileExtensions, asset.fileExtension.toLowerCase());
            //Prevent preview for vid > 5.0 GB. See EMFUX-273 JIRA comments
            var hasPreviewSize = asset.fileSize <= 4995000000

            if (hasPreviewSize && hasPreviewExtension) {
                return true;
            } else {
                return false;
            }

        };

        $scope.hasPreview = function (asset) {
            if (!asset.permissions.export) {
                return false;
            }

            if (!asset || !asset.contentType) {
                return false;
            }

            switch (asset.contentType) {
                case 'BITMAP':
                    return true;
                case 'VIDEO':
                    var isVideoPreview = hasVideoPreviewHelper(asset);
                    return isVideoPreview;
                default:
                    return false;
            }
        };

        $scope.minimizeFooter = function () {
            $analytics.eventTrack('Minimize', { category: 'Download' });
            paneManager.toggleIsDownloadMinimized(true);
            closeDialog();
        };

        var processAnalyticsStartDownload = function () {

            var hasXml = "NO";
            if ($scope.xmlChecked.value) {
                hasXml = "YES";
            }

            if (window.ga) {
                ga('set', 'dimension2', hasXml);
            }

            if ($scope.assetsToTransfer.length > 1) {
                $analytics.eventTrack('Bulk Asset', { category: 'Download' });
            }

            if ($scope.assetsToTransfer.length === 1) {

                $analytics.eventTrack('Single Asset', { category: 'Download', label: ($scope.assetsToTransfer[0].fileName + '').substring(0, 450) });

            }
            if (window.ga) {
                ga('set', 'dimension2', "");
            }
            $analytics.eventTrack('Start', { category: 'Download' });
        };

        $scope.selectedAssets = function () {
            var selected = _.filter($scope.assetsToTransfer, function (asset) {
                return asset.sourceChecked || asset.previewChecked;
            });

            return selected;
        };

        init();
    }]);
})();
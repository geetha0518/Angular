(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.service('AsperaTransfer', ['$rootScope', '$http', '$timeout', '$window',
        function ($rootScope, $http, $timeout, $window, DownloadQueue) {

            var assetsXferHash = {};

            var addToHash = function (asset) {
                assetsXferHash[asset.assetId] = { asset: asset };
            }

            var initializeListeners = function () {
                // This wraps each Aspera callback function in a function that will manually
                // digest all associated scopes. This must be done because the Aspera callbacks
                // occur outside the regular Angular lifecycle.
                var wrapWithDigest = function (fn) {
                    return function (status, obj) {
                        fn(obj);
                        digestAllScopes();
                        
                    };
                };

                // Setup global event handlers required by the plugin
                
                $window.onAsperaLoad = wrapWithDigest(onAsperaLoad);
                $window.onStart = wrapWithDigest(onStart);
                $window.onProgress = wrapWithDigest(onProgress);
                $window.onComplete = wrapWithDigest(onComplete);
                $window.onCancel = wrapWithDigest(onCancel);
                $window.onFailed = wrapWithDigest(onFailed);
                $window.onRemoved = wrapWithDigest(onRemoved);
                $window.onRetry = wrapWithDigest(onRetry);
                $window.onfolderSelected = wrapWithDigest(onfolderSelected);
                
            };

            // We register each scope that depends on AssetTransferService because their digests
            // need to be manually invoked.
            var scopes = [];
            this.registerScope = function (scope) {
                scopes.push(scope);
            }

            var digestAllScopes = function () {
                _.each(scopes, function (scope) {
                    $timeout(function () {
                        scope.$digest();
                    }, 0);
                });
            }

            var onAsperaLoad = function () {
            };

            var onStart = function (obj) {
                // As soon as the transfer starts, lets assign the target title to the asset.transfer object
                // so when we dont have the asset Id anymore in the ddnxferspec because it is gone, we can 
                // iterate through the hash table looking for the obj.title as the target name.
                if (obj.assetId !== undefined) {
                    assetsXferHash[obj.assetId].asset.transfer.target_title = obj.title;
                    assetsXferHash[obj.assetId].asset.transfer.uuid = obj.uuid;
                }
                broadcast(obj);
            };

            var onComplete = function (obj) {
                var currentAsset = getAssetToUpdate(obj);
                currentAsset.asset.transfer.progress = obj.status;
                broadcast(obj);
            };

            var onCancel = function (obj) {
                broadcast(obj);
            };

            var onFailed = function (obj) {
                broadcast(obj);
            };

            var onRemoved = function (obj) {
                broadcast(obj);
            };

            var onRetry = function (obj) {
                broadcast(obj);
            };

            var onfolderSelected = function (selected) {
                folderSelected(selected);
            }

            var onProgress = function (obj) {
                var currentAsset = getAssetToUpdate(obj);
                if (obj.status !== 'completed') {
                    currentAsset.asset.transfer.progress = (obj.percentage * 100);
                } else {
                    currentAsset.asset.transfer.progress = obj.status;
                }

                broadcast(obj);
            };

            var folderSelected = function (obj) {
                $rootScope.$broadcast('downloadsFolderSelected', obj);
            };

            var broadcast = function (obj) {
                $rootScope.$broadcast('broadcastTransferProgress', obj);
            };

            this.getAssetDownloadPlugin = function (requestedAssets, xmlChecked) {
                initializeListeners();

                _.each(requestedAssets, function (asset) {
                    addToHash(asset);
                });

                var mappedAssets = _.map(requestedAssets, function (item) {
                    return {
                        assetId: item.assetId,
                        contentType: item.contentType,
                        previewChecked: item.previewChecked,
                        sourceChecked: item.sourceChecked,
                        fileType: item.fileType,
                        fileSize: item.fileSize
                    };
                });

                return $http.post('/api/AssetDownload/?xmlChecked=' + xmlChecked, mappedAssets);
            };

            this.processCancelDownload = function () {
                $window.fileControls.cancelTransfer();
                $rootScope.$broadcast('broadcastCanceled', {});
            };

            this.showContainingFolder = function (uuid) {
                $window.fileControls.showDirectory(uuid);
            }

            this.clearListCompleted = function () {
                $window.fileControls.removeCompletedFromAspera();
            }

            var getAssetToUpdate = function (obj) {
                if (obj.assetId !== undefined) {
                    return assetsXferHash[obj.assetId];
                } else {
                    var assetToUpdate = _.find(assetsXferHash, function (key) {
                        if (key.asset.transfer.target_title === obj.title) {
                            return key;
                        }
                    });
                    return assetToUpdate;
                }
            };
        }]);
})();
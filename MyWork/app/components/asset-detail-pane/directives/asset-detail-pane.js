(function() {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('assetDetailPane', ['$rootScope', '$http', '$state', '$analytics', 'ClientUserService', 'CollectionService', 'ZipService', 'paneManager', '$location', 'DownloadFactory', 'DownloadManager', 'AssetMetadataService',
    function($rootScope, $http, $state, $analytics, ClientUserService, CollectionService, ZipService, paneManager, $location, DownloadFactory, DownloadManager, AssetMetadataService) {
        var rightPaneSelector = "#asset-preview";
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/asset-detail-pane/views/asset-detail-pane.tpl.html',
            link: function (scope, element, attrs) {
                scope.permissions = ClientUserService.getCurrentUser().permissions;
                scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;

                scope.loadingMetaData = true;

                scope.viewAssetDetails = function (assetId) {
                    $analytics.eventTrack('Detail Page', { category: 'Navigation', label: (scope.asset.fileName + '').substring(0, 450) });
                    $state.get('asset-detail').data['asset'] = scope.asset;
                    $state.go('asset-detail', {
                        id: scope.asset.assetId
                    });
                };

                paneManager.registerRightCallback(function (open, asset) {
                    if (open) {
                        onRightOpen(asset);
                    } else {
                        onRightClose();
                    }
                });

                var approvedPanelStateNames = ['assets', 'collection-assets'];
                var onRightOpen = function(asset) {
                    if (asset && _.contains(approvedPanelStateNames, $state.current.name)) {
                        scope.asset = asset;
                        loadDetails();
                    }
                };

                var onRightClose = function() {
                    scope.closeDetailPane();
                };

                scope.closeDetailPane = function () {
                    scope.asset = null;
                };

                scope.openDownloadDialog = function (asset) {
                    DownloadManager.newModal(asset);
                    
                };

                scope.openZipDialog = function (asset) {
                    ZipService.openDialog(scope.asset);
                }

                scope.showAddAssetsToCollectionDialog = function (asset) {
                    CollectionService.addAssetsToCollectionDialog(asset);
                };

                scope.hasRestrictions = function() {
                    return scope.asset && scope.asset.usageRestrictions && scope.asset.usageRestrictions.length > 0;
                };

                scope.allowImageZoom = function() {
                    if (!scope.asset || !scope.permissions) {
                        return false;
                    }

                    if (!scope.asset.thumb) {
                        return false;
                    }

                    // it would be better if this could be checked another way
                    if (scope.asset.thumb && scope.asset.thumb.indexOf('placeholder_') > -1) {
                        return false;
                    }

                    if (!scope.permissions.assetViewPreview) {
                        return false;
                    }

                    if (scope.asset.permissions && !scope.asset.permissions.previewView) {
                        return false;
                    }

                    if (scope.asset.fileTypeCategory.toLowerCase() == 'zip') {
                        return false;
                    }

                    return true;
                };

                var loadDetails = function() {
                    scope.loadingMetaData = true;

                    if (scope.asset.fileExtension == 'ZIP') {
                        $http.get('api/IntrospectArchive/' + scope.asset.assetId)
                        .success(function(data) {
                            scope.asset.zipContent = data.fileList;
                        });
                    }
                    scope.asset.zoomSource = {
                        image: '',
                        isLoading: true
                    };

                    AssetMetadataService
                        .getAssetSourceImage(scope.asset.assetId)
                        .then(function(data) {
                            var src = JSON.parse(data);

                            if (src) {
                                scope.asset.zoomThumb = src;
                                scope.asset.zoomSource.image = src;
                            } else {
                                scope.asset.zoomThumb = scope.asset.thumb;
                                scope.asset.zoomSource.image = scope.asset.thumb;
                            }

                            scope.asset.zoomSource.isLoading = false;
                        });
                };
            }
        };
    }]);
})();

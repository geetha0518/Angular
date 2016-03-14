(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.controller('AssetDetailController',
            ['$scope', '$stateParams', '$state','AssetMetadataService', 'CollectionService', 'DownloadManager', 'ClientUserService', 'SimpleHistoryService','AssetSearchService',
    function ($scope, $stateParams, $state, AssetMetadataService, CollectionService, DownloadManager, ClientUserService, SimpleHistoryService , AssetSearchService) {

        $scope.$emit('cancel-collection-requests', {});
        var assetId = $stateParams.id;
        $scope.assetFound = -1; //3 states: loading, found, not-found
        $scope.previousPage = SimpleHistoryService.backHistory();
       
        // permissions
        $scope.permissions = ClientUserService.getCurrentUser().permissions;
        $scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;
     
        // View Model
        $scope.asset = {
            assetId: $stateParams.id,
            model: {
                assetId: $stateParams.id,
                isLoading: true
            },
            collections: {
                hasCollections: false,
                isLoading: true
            },
            metadata: {
                hasMetadata: false,
                isLoading: true
            },
            zoomSource: {
                image: "",
                isLoading: true
            },
            searchedAsset: {
                isLoading : true    
            }
        };
        
        // UI Restriction
        $scope.disableAddToCollection = function() {
            return $scope.asset.model.isLoading || $scope.asset.collections.isLoading;
        };

        // UI Action Method
        $scope.addToCollection = function () {
            var asset = _
                .extend({
                    collections: $scope.asset.collections.collections
                }, $scope.asset.model);

            CollectionService.addAssetsToCollectionDialog(asset);
        };


        
        

        // UI Restriction
        $scope.disablePreview = function () {
            return $scope.asset.searchedAsset.isLoading;
        };

        // UI Restriction
        $scope.disableDownload = function() {
            return $scope.asset.searchedAsset.isLoading;
        };

        // UI Action Method
        $scope.openDownloadDialog = function () {
            DownloadManager.newModal($scope.asset.searchedAsset);
        };

        var loadMetaDatata = function () {
           
            AssetMetadataService
                .getAssetMetadata(assetId)
                .then(function (data) {
                    $scope.asset.metadata = _.extend($scope.asset.metadata, data);

                    // Enforce section and field sort order
                    $scope.asset.metadata.sections = _.sortBy($scope.asset.metadata.sections, function (section) {
                        section.fields = _.sortBy(section.fields, function (field) {
                            return field.sortOrder;
                        });

                        return section.sortOrder;
                    });

                    if (data) {
                        $scope.asset.metadata.hasMetadata = true;
                    }

                    $scope.asset.metadata.isLoading = false;
                });

            AssetMetadataService
                .getAssetModel(assetId)
                .then(function (data) {
                    $scope.asset.model = _.extend($scope.asset.model, data);
                    $scope.asset.model.isLoading = false;

                    if (!$scope.asset.zoomSource.isLoading && !$scope.asset.zoomSource.image) {
                        $scope.asset.zoomSource.image = $scope.asset.model.thumbnail;
                    }
                });

            AssetMetadataService
                .getAssetCollections(assetId)
                .then(function (data) {

                    if (data && data.length > 0) {
                        $scope.asset.collections.collections = data;
                        $scope.asset.collections.hasCollections = true;
                    }

                    $scope.asset.collections.isLoading = false;
                });

            AssetMetadataService
                .getAssetSourceImage(assetId)
                .then(function (data) {
                    var src = JSON.parse(data);

                    if (src) {
                        $scope.asset.zoomSource.image = src;
                    } else if (!$scope.asset.model.isLoading) {
                        $scope.asset.zoomSource.image = $scope.asset.model.thumbnail;
                    }

                    $scope.asset.zoomSource.isLoading = false;
                });
        };


        // Private
        var init = (function () {
          
            var searchedAsset = $state.current.data.asset;
            // if searchedAsset is not in scope, then we get it.
            if (searchedAsset) {
                $scope.asset.searchedAsset = _.extend($scope.asset.searchedAsset, searchedAsset);
                $scope.asset.searchedAsset.isLoading = false;
                $scope.assetFound = 1;
                loadMetaDatata();
            } else {
                //search asset, enable download button only after search
                var params = AssetSearchService.defaultParams();
                params.filters.push({
                    displayField: "Keyword",
                    displayTerm: assetId,
                    field: "SYSTEMX.KEYWORD",
                    term: assetId
                });

                var search = AssetSearchService.searchWithSearchParams(params);
                search.success(function (result) {

                    var searchedAsset = result.results[0];
                    $scope.asset.searchedAsset = _.extend($scope.asset.searchedAsset, searchedAsset);
                    $scope.asset.searchedAsset.isLoading = false;

                }).error(function () {

                    $scope.assetFound = 0;

                }).then(function () {

                    if ($scope.asset.searchedAsset.assetId) {
                        $scope.assetFound = 1;
                        loadMetaDatata();
                    } else {
                        $scope.assetFound = 0;
                    }
                   
                });

            }

          

        })();

  
        // Utility Method for Asset Thumb Display
        $scope.hasRestrictions = function() {
            return $scope.asset && $scope.asset.model.hasRestrictions;
        };

        // Utility Method for Asset Thumb Zoom
        $scope.allowImageZoom = function() {
            if (!$scope.asset || !$scope.permissions || $scope.asset.model.isLoading) {
                return false;
            }

            var viewPermission = true;
            
            // thumbnail exists?
            if (!$scope.asset.model.thumbnail) {
                viewPermission = false;
            }

            // it would be better if this could be checked another way
            if ($scope.asset.model.thumbnail && $scope.asset.model.thumbnail.indexOf('placeholder_') > -1) {
                viewPermission = false;
            }

            // user has preview permission?
            if (!$scope.permissions.assetViewPreview) {
                viewPermission = false;
            }

            // user has preview permission on *this* asset?
            if ($scope.asset.metadata.permissions && !$scope.asset.metadata.permissions.previewView) {
                viewPermission = false;
            }

            // is a zip?
            if ($scope.asset.model.fileTypeCategory.toLowerCase() == 'zip') {
                return false;
            }

            return viewPermission;
        };
    }]);
})();
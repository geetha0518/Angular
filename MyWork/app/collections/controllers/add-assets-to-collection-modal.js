(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('AddAssetsToCollectionModalController',
        ['$rootScope', '$scope', '$state', '$timeout', 'CollectionService', 'closeAddAssetsToCollectionDialog', 'collectionAssets',
    function ($rootScope, $scope, $state, $timeout, CollectionService, closeAddAssetsToCollectionDialog, collectionAssets) {
        $scope.submitted = false;
        $scope.errorMessage = "";

        $scope.loadingCollections = true;

        $scope.request = {
            collections: [],
            assets: collectionAssets,
           }
        

        var init = function () {
            loadData();
        };
    
        var loadData = function () {
            var isCollectionPage = $state.current.name === "collection-assets";

            return CollectionService.getUserCollections(false)
                .then(function (response) {
                    var collections = response.data;
                    var currentCollectionId = parseInt($state.params.id, 10);

                    var currentCollection = _.find(collections, function(collection) {
                        return collection.collectionId === currentCollectionId;
                    });

                    $scope.request.collections = _.filter(collections, function (collection) {
                        return collection.isOwner && collection.collectionId !== currentCollectionId;
                    });

                    if ($scope.request.collections.length > 0) {
                        $scope.submitted = false;
                    } else {
                        if (isCollectionPage && currentCollection.isOwner) {
                            $scope.errorMessage = "These assets have all already been added to the only collection you own.";
                        } else {
                            $scope.errorMessage = "You do not own any collections. Only a collection owner can add assets to them.";
                        }
                        $scope.submitted = true;
                    }
                }).finally(function () {
                    if ($scope.request.collections.length === 1) {
                        $scope.request.collections[0].selected = true;
                    }

                    $scope.loadingCollections = false;
                });;
        };

        $scope.closeModal = function () {
            closeAddAssetsToCollectionDialog();
        };

        $scope.hasError = function () {
            return $scope.errorMessage && $scope.errorMessage.length > 0;
        };

        $scope.add = function () {
            $scope.errorMessage = "";
            $scope.submitted = true;
            $scope.hideDeleteCancelButton = false;
            
            var selectedCollectionIds = $scope.selectedCollections().map(function (collection) {
                return parseInt(collection.collectionId, 10);
            });

            var assets = $scope.request.assets.map(function (asset) {
                return { assetId: asset.assetId, filename: asset.assetName };
            });

            if (selectedCollectionIds.length === 0) {
                $scope.errorMessage = "You must select at least one collection to add to.";
                return;
            }

            $scope.loadingResponse = true;
            $scope.submitted = true;

            CollectionService
                .addAssetsToMultipleCollections(selectedCollectionIds, assets)
                .then(function (collections) { // Success Handler
                        $scope.hideDeleteCancelButton = true;
                        updateAssetCollections(collections.data);
                    },
                    function () { // Failure Handler
                        $scope.errorMessage = 'There was a error adding assets to the requested collection.';
                    }
                ).finally(function () {
                    $scope.loadingResponse = false;
                });
        };

        // Adds collection information so their badge indicators display correctly on asset tiles,
        // and collection links display correctly in the asset detail pane.
        var updateAssetCollections = function(collections) {
            // Create a map relating collectionIds to full collection objects.
            var collectionLookup = _.object(_.map($scope.request.collections, function(collection) {
                return [collection.collectionId, collection];
            }));

            // Iterate over the network response and add the full collection object to
            // the original asset object.
            var assetsUpdated = [];
            _.each(collections, function (collection) {
                _.each(collection.assetIds, function (assetId) {
                    var asset = _.find($scope.request.assets, function (asset) {
                        return asset.assetId === assetId;
                    });

                    if (!_.contains(asset.collections, collection.collectionId)) {
                        // Look up the full collection object.
                        collection = collectionLookup[collection.collectionId];

                        // add it to the asset.
                        asset.collections.push(collection);
                        asset.collectionTitles = asset.collections.map(function (element) { return element.title; }).join(", ");
                        assetsUpdated.push(asset);
                    }
                });
            });

            $timeout(function () { $rootScope.$broadcast('asset-collections-updated', assetsUpdated); }, 0);
        };

        $scope.selectedCollections = function () {
            return _.filter($scope.request.collections, function (collection) {
                return collection.selected;
            });
        };

        $scope.selectedAutoDLCollections = function () {
            var autoDLCount = 0;
            _.each($scope.request.collections, function (collection) {
                if (collection.selected && collection.isAutodownloaderEnabled) {
                    autoDLCount++;
                }
            });

            return autoDLCount;
        }

        init();
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.service('CollectionService', [
        '$rootScope', '$http', '$q', '$modal', '$analytics', '$log', 'AssetSearchService',
        function($rootScope, $http, $q, $modal, $analytics, $log, AssetSearchService) {
            var requests = [];

            var getAssetIdFilenames = function(assets) {
                if (Array.isArray(assets)) {
                    return _.map(assets, function(item) {
                        return { assetId: item.assetId, filename: item.assetName };
                    });
                }

                return [{ assetId: assets.assetId, filename: assets.assetName }];
            };

            var getAssetIds = function (assets) {
                if (Array.isArray(assets)) {
                    return _.map(assets, function (item) { return item.assetId; });
                }

                return [assets.assetId];
            };

            this.getUserCollections = function(isActive) {
                var cancellor = $q.defer();
                requests.push(cancellor);
                return $http.get('/api/Collections', { params: { archived: isActive, timeout: cancellor.promise } });
            };

            this.getUserCollectionsByTitle = function (isActive, title) {
                var cancellor = $q.defer();
                requests.push(cancellor);
                return $http.get('/api/Collections', { params: { archived: isActive, name: title, timeout: cancellor.promise } });
            };


            this.notifyCollectionUsers = function (requestData) {
                return $http.post('api/Collections/CollectionNotification', requestData);
            }

            this.validateCollectionTitle = function ( collectionTitle ) {

                var requestData = {
                    Title: collectionTitle
                };
                
                return $http.post('api/Collections/validate/title', requestData);
            };

            this.createCollection = function (requestData) {

                return $http.post('/api/Collections', requestData);

            };

            this.getCollection = function(collectionId) {
                var cancellor = $q.defer();
                requests.push(cancellor);
                return $http.get('/api/Collections/' + collectionId, { timeout: cancellor.promise });
            };

            this.getCollectionAssets = function (collectionId, extParams) {

                var defaultParams = {
                    offset: 0,
                    limit: AssetSearchService.defaultLimit,
                    sortTerms: {
                        field: "ARTESIA.FIELD.DATE_IMPORTED",
                        order: "desc"
                    },
                    dateUploadedRange: {
                        field: "ARTESIA.FIELD.DATE_IMPORTED",
                        start: '',
                        end: ''
                    }
                };

                // providing one date for DateImported (either From or To) is a valid case, therefore need to handle that
                handleMissingDateImported(extParams);

                // UI adds event date as search param which need to be filtered out
                extParams.searchTerms = _.filter(extParams.searchTerms, function(searchParam) {
                    return searchParam.field !== 'FOX.FIELD.FXSP_EVENT_DATE';
                });

                var searchCriteria = _.extend(defaultParams, extParams);

                var cancellor = $q.defer();
                requests.push(cancellor);
                return $http.get('/api/collection/' + collectionId + '/assets/', { params: searchCriteria, timeout: cancellor.promise });
            };

            var handleMissingDateImported = function(extParams) {
                if (extParams.dateFilters) {
                    var dateFilters = _.map(extParams.dateFilters, angular.fromJson);
                    _.each(dateFilters, function(filter) {
                        if (filter.field === "ARTESIA.FIELD.DATE_IMPORTED") {
                            if (!filter.start) {
                                // default as per business rules
                                filter.start = new Date("1/1/1900");
                            } else if (!filter.end) {
                                // default as per business rules
                                filter.end = new Date();
                            }
                        }
                    });
                    extParams.dateFilters = _.map(dateFilters, angular.toJson);
                }
            };

            this.addAssetsToCollectionDialog = function(assets) {
                if (!Array.isArray(assets)) {
                    assets = [assets];
                }
                var modalHandler = $modal.open({
                    templateUrl: '/Scripts/app/collections/views/add-assets-to-collection.tpl.html',
                    controller: 'AddAssetsToCollectionModalController',
                    resolve: {
                        closeAddAssetsToCollectionDialog: function() {
                            return function() {
                                if (modalHandler) {
                                    modalHandler.close();
                                }
                            }
                        },
                        collectionAssets: function() {
                            return assets;
                        }
                    },
                    windowClass: "collection-modal"
                });
            };

            this.removeAssetsFromCollectionDialog = function (assets) {
                if (!Array.isArray(assets)) {
                    assets = [assets];
                }

                var modalHandler;
                modalHandler = $modal.open({
                    templateUrl: '/Scripts/app/collections/views/remove-assets-from-collection.tpl.html',
                    controller: 'RemoveCtrl',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        closeRemoveAssetfromCollectionDialog: function () {
                            return function () {
                                if (modalHandler) {
                                    modalHandler.close();
                                }
                            }
                        },
                        collectionAssets: function() {
                            return assets;
                        }
                    },
                   
                });
                  
                 
               
            };

            
            this.addAssetsToCollection = function(collectionId, collectionAssets) {
                $analytics.eventTrack('Add', { category: 'Collections' });

                var data = {
                    collectionIds: [collectionId],
                    assets: getAssetIdFilenames(collectionAssets)
                };

                return $http.put('/api/collection/assets/', data);
            };

            // The collectionIds and assetIds have specific types.
            // Collection ids are integer. Asset ids are strings.
            // collectionIds: List<int>
            // assetIds: List<str>
            this.addAssetsToMultipleCollections = function (collectiondIds, assetIds) {

                if (assetIds.length > 1)

                    $analytics.eventTrack('Bulk Add', { category: 'Collections' });

                if (assetIds.length === 1)
                    $analytics.eventTrack('Single Add', { category: 'Collections' });

                var data = {
                    collectionIds: collectiondIds,
                    assets: assetIds
                };

                return $http.put('/api/collection/assets/', data);
            };

            this.removeAssetsFromCollection = function(collectionId, assets) {
                var assetIds = getAssetIds(assets);
               
                $analytics.eventTrack('Remove', { category: 'Collections' });
                return $http.delete('/api/collection/' + collectionId + '/assets/', { params: { assetIds: assetIds } });
            };

            this.cancelPendingRequests = function() {
                _.each(requests, function(request) {
                    request.resolve("Canceled Request");
                });
                requests = [];
            };
        }]);
})();

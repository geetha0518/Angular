(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.service('AssetMetadataService', ['$http', '$q', 'DSCacheFactory', function ($http, $q, DSCacheFactory) {
        // Requests metadata from server
        this.getAssetMetadata = function (assetId) {
            return makeCachedRequest('/api/Asset/' + assetId + '/Metadata');
        };

        // Requests asset model from server
        this.getAssetModel = function (assetId) {
            return makeCachedRequest('/api/Asset/' + assetId + '/Model');
        };

        // Requests the asset's collection from server
        this.getAssetCollections = function (assetId) {
            return makeUncachedRequest('/api/Asset/' + assetId + '/Collections');
        };

        // Request image preview from server
        this.getAssetPreviewImage = function (assetId) {
            return makeCachedRequest('/api/AssetPreview/' + assetId + '/PREVIEW');
        };

        // Request image source from server
        this.getAssetSourceImage = function (assetId) {
            return makeCachedRequest('/api/AssetPreview/' + assetId + '/IMAGE');
        };

        this.getSecurityPolicies = function () {
            return makeCachedRequest('/api/Security/Asset/Policies/all');
        };

        var makeUncachedRequest = function (resource) {
            var deferred = $q.defer();

            var request = $http.get(resource);

            request.success(function (data) {
                if (data === "null") {
                    deferred.resolve(null);
                }
                deferred.resolve(data);
            });

            request.error(function () {
                deferred.reject();
            });

            return deferred.promise;
        };

        var makeCachedRequest = function (resource) {
            var defaultCache = DSCacheFactory.get('defaultCache');
            var deferred = $q.defer();

            var request = $http.get(resource, {
                cache: defaultCache
            });

            request.success(function (data) {
                if (data === "null") {
                    deferred.resolve(null);
                }
                deferred.resolve(data);
            });

            request.error(function () {
                deferred.reject();
            });

            return deferred.promise;
        };
       
    }]);
})();
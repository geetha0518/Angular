(function () {
    'use strict';

    var module = angular.module('fmc.search');

    module.directive('assetCardTile', ['$state', 'paneManager', 'CollectionService', 'ClientUserService',
        function ($state, paneManager, CollectionService, ClientUserService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                hasRestrictions: '@',
                asset: '='
            },
            templateUrl: '/Scripts/app/search/views/asset-card-tile.tpl.html',
            link: function (scope, element, attrs) {
                scope.permissions = ClientUserService.getCurrentUser().permissions;
                scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;

                scope.isHomePage = function () {
                    return $state.current.name === 'home';
                };

                scope.showAddAssetsToCollectionDialog = function (asset) {
                    CollectionService.addAssetsToCollectionDialog(asset);
                };

                scope.hasRestrictions = function () {
                    return scope.asset.usageRestrictions && scope.asset.usageRestrictions.length > 0;
                };

                scope.hasRevisions = function () {
                    return (scope.asset.version > 1 || scope.asset.revision > 0);
                };

                scope.collectionNames = function (collections) {
                    return _.map(collections, function (item) {
                        return item.title;
                    }).join(', ');
                };

                scope.conditionalClass = function () {
                    // TODO: Something strange is happening with scope.hasRestrictions. It isn't accessible here.
                    // This makes it available here. Maybe it has something to do with this stuff being in the link function?
                    var hasRestrictions = function () {
                        return scope.asset.usageRestrictions && scope.asset.usageRestrictions.length > 0;
                    };

                    if (scope.asset.selected && !hasRestrictions()) {
                        return 'unrestricted';
                    }

                    if (hasRestrictions()) {
                        return 'restricted';
                    }

                    return "";
                };

                scope.showDetail = function () {
                    if (ClientUserService.getCurrentUser().permissions.assetViewMetadata) {
                        paneManager.toggleRight(true, scope.asset);
                    }
                };

                element.on('$destroy', function () {
                    scope.asset = null;
                });
            }
        };
    }]);
})();
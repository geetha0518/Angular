(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('tableAssetFilename', ['$state','$analytics', "ClientUserService", "ZipService", function ($state, $analytics , ClientUserService, ZipService) {
        return {
            restrict: 'A',
            templateUrl: '/Scripts/app/components/user-experiences/views/table-asset-filename.tpl.html',
            scope: true,
            replace: true,
            link: function (scope, element, attrs, ctrl) {
                scope.canViewAssetDetail = ClientUserService.getCurrentUser().permissions.assetViewMetadata || false;

                scope.isHomePage = function () {
                    return $state.current.name === 'home';
                };

                scope.viewAssetDetails = function (asset) {
                    $analytics.eventTrack('Detail Page', { category: 'Navigation', label: asset.assetName.substring(0, 450) });
                    $state.get('asset-detail').data['asset'] = asset;
                    $state.go('asset-detail', {
                        id: asset.assetId
                    });
                };

                scope.openZipDialog = function (asset) {
                    ZipService.openDialog(asset);
                }
            }
        }
    }]);
})();

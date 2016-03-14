(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('assetTileMetadata', ['$state', '$analytics', 'ClientUserService', 'ZipService', function ($state, $analytics ,ClientUserService, ZipService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/Scripts/app/components/user-experiences/views/asset-tile-metadata.tpl.html',
            scope: true,
            link: function (scope, element, attrs) {
                scope.ClientUserService = ClientUserService;

                scope.viewAssetDetails = function (assetId) {

                    $analytics.eventTrack('Detail Page', { category: 'Navigation', label: (scope.asset.fileName + '').substring(0, 450) });
                    $state.get('asset-detail').data['asset'] = scope.asset;
                    $state.go('asset-detail', {
                        id: scope.asset.assetId
                    });


                };

                scope.openZipDialog = function (asset) {
                    ZipService.openDialog(asset);
                };
            }
        }
    }]);

    var registerDirective = function (name, template) {
        module.directive(name, [function () {
            return {
                restrict: 'E',
                replace: false,
                templateUrl: '/Scripts/app/components/user-experiences/views/' + template,
                scope: true,
            };
        }]);
    }

    registerDirective('fmcMetadata', 'fmc/fmc-metadata.tpl.html');
    registerDirective('ficMetadata', 'fic/fic-metadata.tpl.html');
    registerDirective('foxSportsMetadata', 'fox-sports/fox-sports-metadata.tpl.html');
})();

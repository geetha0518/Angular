(function() {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('quickviewMetadata', ['$analytics', '$state', 'ClientUserService', function ($analytics, $state, ClientUserService) {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/user-experiences/views/quickview-metadata.tpl.html',
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

    registerDirective('fmcQuickviewMetadata', 'fmc/fmc-quickview-metadata.tpl.html');
    registerDirective('ficQuickviewMetadata', 'fic/fic-quickview-metadata.tpl.html');
    registerDirective('foxSportsQuickviewMetadata', 'fox-sports/fox-sports-quickview-metadata.tpl.html');
})();

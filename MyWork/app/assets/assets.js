(function () {
    'use strict';

    var module = angular.module('fmc.assets', [
        'fmc.common',
        'ui.router'
    ]);

    module.config(['$stateProvider', 'UserRoleConstants', function ($stateProvider, UserRoleConstants) {
        $stateProvider
            .state('asset-detail', {
                url: '/assets/:id',
                resolve: {},
                views: {
                    "main": {
                        controller: 'AssetDetailController',
                        templateUrl: '/Scripts/app/assets/views/asset-detail.tpl.html'
                    }
                },
                data: {
                    pageTitle: 'Asset Detail',
                },
                authorization: {
                    requiredPermissions: [
                        'assetViewMetadata'
                    ]
                }
            });
    }]);
})();

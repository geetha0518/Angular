(function () {
    'use strict';

    var module = angular.module('fmc.search', [
        'fmc.common',
        'fmc.imagezoom',
        'fmc.components'
    ]);

    module.controller('ZoomCtrl', ['$scope',
        function ($scope) {
            $scope.switchImage = function (imageSrc) {
                $scope.imageSrc = imageSrc;
            };
        }
    ]);

    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('assets', {
                url: '/assets?filters&offset&sort&limit&view&dateFilters&all&useCache',
                resolve: {},
                reloadOnSearch: false,
                cache: false,
                views: {
                    "main": {
                        controller: 'AssetSearchController',
                        templateUrl: '/Scripts/app/search/views/asset-search.tpl.html'
                    }
                },
                data: {
                    pageTitle: 'Search'
                },
                authorization: {
                    allowAll: true
                }
            });
    }]);
})();
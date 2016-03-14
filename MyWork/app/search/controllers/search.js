(function() {
    'use strict';

    var module = angular.module('fmc.search');

    module.controller('SearchController', ['$scope', '$state', '$location', function ($scope, $state, $location) {

        $scope.performAssetSearch = function(searchTerms) {
            var stateParams = {
                filters: angular.toJson(searchTerms),
                offset: 0
            };

            $state.go('assets', stateParams).then(function () {
                $location.search({ 'filters': stateParams.filters, 'offset': stateParams.offset });
            });
        };

        $scope.$on('search-submitted', function(ev, searchTerms, name) {
            if (name === "navigation-search") {
                $scope.performAssetSearch(searchTerms);
            }
        });
    }]);
})();
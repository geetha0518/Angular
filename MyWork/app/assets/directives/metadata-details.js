(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.directive('metadataDetails', [function () {
        return {
            restrict: 'E',
            scope: {
                details: '=',
            },
            templateUrl: '/Scripts/app/assets/views/metadata-details.tpl.html',
            controller: function ($scope) {
                $scope.showAll = false;

                $scope.toggleShowAll = function () {
                    $scope.showAll = !$scope.showAll;
                };

                $scope.limit = 5;
                $scope.getLimit = function () {
                    if ($scope.showAll) {
                        return Infinity;
                    } else {
                        return $scope.limit;
                    }
                }

                var isValidMetadata= function(field) {
                    return !!field.value;
                };

                $scope.filteredDetails = [];

                var filterDetails = function (newVal, oldVal) {
                    $scope.filteredDetails = _.filter($scope.details.fields, isValidMetadata);
                };

                $scope.$watch('details', filterDetails, true);
            }
        };
    }]);
})();

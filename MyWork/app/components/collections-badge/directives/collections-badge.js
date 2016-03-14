(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('collectionsBadge', [function () {
        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/Scripts/app/components/collections-badge/views/collections-badge.tpl.html',
            scope: {
                collections: "="
            },
            controller: function($scope) {
                $scope.collectionTitles = function () {
                    var titles = _.map($scope.collections, function (collection) {
                        return collection.title;
                    });

                    return titles.join(", ");
                };
            }
        };
    }]);
})();

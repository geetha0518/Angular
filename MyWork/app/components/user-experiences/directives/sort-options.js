(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('sortOptions', ['SortOptionsService', function (SortOptionsService) {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/user-experiences/views/sort-options.tpl.html',
            scope: true,
            link: function (scope, element, attrs) {
                scope.sortOptions = SortOptionsService.sortOptions;
            }
        }
    }]);
})();
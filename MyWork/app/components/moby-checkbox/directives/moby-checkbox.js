(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('mobyCheckbox', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/Scripts/app/components/moby-checkbox/views/moby-checkbox.tpl.html',
            scope: {
                selected: '=',
                disabled:'='
            }
        };
    });
})();
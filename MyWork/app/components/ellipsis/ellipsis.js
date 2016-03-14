(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('ellipsis', [function () {
        return {
            restrict: 'E',
            scope: {
                fulltext: '@',
                maxwidth: '@'
            },
            transclude: true,
            templateUrl: '/Scripts/app/components/ellipsis/ellipsis.tpl.html',
            link: function (scope, element, attrs, ctrl) {
                attrs.maxwidth = (attrs.maxwidth) ? attrs.maxwidth : 75;
            }
        };
    }]);
})();
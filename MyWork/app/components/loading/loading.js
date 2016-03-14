(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('loading', function () {
        return {
            restrict: 'E',
            scope: {
                isloading: '='
            },
            transclude: true,
            templateUrl: '/Scripts/app/components/loading/loading.tpl.html',
            link: function (scope, element, attrs, ctrl) {
               
            }
        };
    });
})();
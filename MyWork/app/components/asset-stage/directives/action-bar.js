(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('actionBar', [function () {
        return {
            restrict: 'E',
            scope: {
                //sortoptions: '=',
            },
            replace: true,
            require: '^assetStage',
            transclude: true,
            templateUrl: '/Scripts/app/components/asset-stage/views/action-bar.tpl.html',
            controller: function ($scope) {

            },
            link: function (scope, element, attrs, ctrl) {
               
            }
        };
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive("viewPanel", [function () {
        return {
            restrict: 'E',
            scope: {
                linkto: '@'
            },
            require: '^assetStage',
            transclude: true,
            replace: true,
            templateUrl: '/Scripts/app/components/asset-stage/views/view-panel.tpl.html',
            link: function (scope, element, attrs, ctrl) {
                ctrl.addPanel(scope);

                scope.$on("$destroy", function () {
                    ctrl.removePanel(scope);
                });
            }
        };
    }]);
})();

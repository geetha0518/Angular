(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('viewTab', [function () {
        return {
            restrict: 'E',
            scope: {
                icon: '@',
                helptext: '@',
                linkto: '@'
            },
            transclude: true,
            replace: true,
            templateUrl: '/Scripts/app/components/asset-stage/views/view-tab-button.tpl.html',
            require: '^assetStage',
            link: function (scope, element, attrs, ctrl) {
                ctrl.addTab(scope);
                scope.selectTab = ctrl.selectTab;
                scope.$on("$destroy", function () {
                    ctrl.removeTab(scope);
                });
            }
        };
    }]);
})();

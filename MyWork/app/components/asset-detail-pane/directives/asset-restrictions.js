(function() {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('assetRestrictions', [function () {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/asset-detail-pane/views/asset-restrictions.tpl.html',
            scope: {
                asset: "="
            },
            link: function (scope, elem, attrs) {
                scope.showShortRestriction = true;

                scope.toggleRestrictionText = function () {
                    scope.showShortRestriction = !scope.showShortRestriction;
                }

                scope.hasRestrictions = function () {
                    if (scope.asset !== null && typeof scope.asset !== 'undefined') {
                        return scope.asset.usageRestrictions;
                    }
                };
            }
        }
    }]);
})();

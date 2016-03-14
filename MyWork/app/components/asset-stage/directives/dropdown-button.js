(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('dropdownButton', [function () {
        return {
            restrict: 'E',
            scope: {
                itemlist: '=',
                onselect: '='
            },
            transclude: true,
            replace: true,
            templateUrl: '/Scripts/app/components/asset-stage/views/dropdown-button.tpl.html',
            controller: function ($scope) {

            },
            link: function (scope, element, attrs, ctrl) {
                scope.selectedItem = (function () {
                    var item = _.find(scope.itemlist, function (item) { return item.selected; });

                    if (item) {
                        return item;
                    }

                    // returns default item (not populated into list)
                    return { displayName: "Select one" };
                })();

                scope.selectItem = function (item) {
                    scope.selectedItem = item;

                    _.each(scope.itemlist, function (item) { item.selected = false; });
                    item.selected = true;

                    scope.onselect(item);
                }
            }
        };
    }]);
})();

(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('tableCollectionsBadge', [function () {
        return {
            restrict: 'A',
            templateUrl: '/Scripts/app/components/user-experiences/views/table-collections-badge.tpl.html',
            scope: true,
            replace: true
        }
    }]);
})();

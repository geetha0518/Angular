(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('tableActions', ['$state', 'ClientUserService', function ($state, ClientUserService) {
        return {
            restrict: 'A',
            templateUrl: '/Scripts/app/components/user-experiences/views/table-actions.tpl.html',
            scope: true,
            replace: true,
            link: function (scope, element, attrs) {
                scope.permissions = ClientUserService.getCurrentUser().permissions;
                scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;

                scope.isHomePage = function () {
                    return $state.current.name === 'home';
                };
            }
        }
    }]);
})();

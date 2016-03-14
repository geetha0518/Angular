(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.directive('collectionLink', ['$state', function ($state) {
        return {
            restrict: 'E',
            scope: {
                collection: '='
            },
            templateUrl: '/Scripts/app/collections/views/collection-link.tpl.html',
            controller: function ($scope) {
                $scope.collectionHref = function(collectionId) {
                    return '/collection/' + collectionId + '/assets/';
                };
            }
        };
    }]);
})();

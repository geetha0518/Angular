(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.controller('accordionIsolate', ['$scope', function ($scope) {
        $scope.$watch(
            function () { return $scope.group.isOpen; },
            function () {
                $scope.$emit('accordionIsolateIsOpen', $scope.group);
            });
    }]);
})();
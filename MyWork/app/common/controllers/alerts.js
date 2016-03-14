(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.controller('AlertsController', ['$scope', '$timeout', 'messageService', function ($scope, $timeout, messageService) {
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        messageService.on('fmc.common.alert-error', $scope, function(e, message) {
            $scope.alerts.push({ type: 'danger', message: message});
        });

        messageService.on('fmc.common.alert-success', $scope, function(e, message) {
            $scope.alerts.push({ type: 'primary', message: message });
        });
    }]);
})();
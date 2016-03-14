(function () {
    'use strict';

    var module = angular.module('fmc.help');

    module.controller('HelpController', ['$scope', 'ClientUserService', function ($scope, ClientUserService) {
        $scope.ClientUser = ClientUserService;
    }]);
})();
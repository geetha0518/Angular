(function () {
    'use strict';

    var module = angular.module('fmc.transfers', [
        'ui.router'
    ]);


    module.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('autodownloader-transfers', {
            url: '/transfers',
            views: {
                "main": {
                    controller: 'TransfersController',
                    templateUrl: '/Scripts/app/transfers/views/transfers.tpl.html'
                }
            },
            data: {
                pageTitle: 'Autodownloader Transfers'
            },
            authorization: {
                allowAll: true
            }
        });
    }]);
})();
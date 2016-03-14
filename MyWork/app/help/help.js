(function () {
    'use strict';

    var module = angular.module('fmc.help', [
        'fmc.common',
        'ui.router'
    ]);

    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('help', {
            url: '/help',
            views: {
                "main": {
                    controller: 'HelpController',
                    templateUrl: '/Scripts/app/help/views/help.tpl.html'
                }
            },
            data: {
                pageTitle: 'Help'
            },
            authorization: {
                allowAll: true
            }
        });
    }]);
})();
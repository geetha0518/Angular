(function () {
    'use strict';

    var module = angular.module('fmc.history', [
        'fmc.common',
        'ui.router'
    ]);

    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('history', {
            url: '/history',
            views: {
                "main": {
                    controller: 'DownloadUploadHistoryController',
                    templateUrl: '/Scripts/app/history/views/history.tpl.html'
                }
            },
            data: {
                pageTitle: 'History'
            },
            authorization: {
                denyAll: true
            }
        });
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.directive('downloadAsset', ['$http', '$q', 'DownloadFactory', 'DownloadManager', function ($http, $q, DownloadFactory, DownloadManager) {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/download/views/download-asset-button.tpl.html',
            transclude: false,
            link: function (scope, element) {
                var modalHandler;

                scope.isDownloadable = function (asset) {
                    
                    if (!asset) {
                        return false;
                    } else {
                        return true;
                    }
                };

                scope.openDialog = function (assets) {
                   
                    DownloadManager.newModal(assets);
                }
            }
        }; 
    }]);
})();
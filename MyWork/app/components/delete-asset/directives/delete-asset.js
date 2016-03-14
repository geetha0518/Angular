(function () {
    'use strict';

    var module = angular.module('fmc.delete');

    module.directive('deleteAsset', ['$http', '$q', 'deleteAssetService',  function ($http, $q, deleteAssetService) {
        return {
            restrict: 'E',
            transclude: false,
            templateUrl: '/Scripts/app/components/delete-asset/views/delete-asset-button.tpl.html',
            link: function (scope, element) {
                scope.deleteAsset = function (assets) {
                    deleteAssetService.newModal(assets);
                }
            }
        };
    }]);
})();
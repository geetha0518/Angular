(function () {
    'use strict';

    var module = angular.module('fmc.components')
    module.controller('ZipController', ['$scope', '$modalInstance', '$analytics', 'ZipService', 'assetId', 'assetName',
        function ($scope, $modalInstance, $analytics, ZipService, assetId, assetName) {
        $scope.errorMessage = "";
        
        var onSuccess = function () {
            $('.modal-dialog').width('530');
        };

        var onError = function (response) {
            $('.modal-dialog').width('530');
            $scope.errorMessage = "File contents not found.";
            $scope.$apply();
        };
        
        $modalInstance.opened.then(
                function () {
                    //we wait 10 milliseconds because it takes time for angularjs to create the modal
                    //and attach id="introspection-component" into the DOM
                    setTimeout(function () {
                        FOXPLATFORM.embed({
                            assetId: assetId,
                            componentId: "archive-introspection",
                            containerId: "introspection-component",
                            onSuccess: onSuccess,
                            onError: onError
                        });
                    }
                    , 10);
                });

        $scope.closeModal = function () {
            $analytics.eventTrack('Close Viewer', { category: 'Zip Introspection', label: assetName });
            $modalInstance.close();
        };

    }]);

    module.service('ZipService', ['$modal', '$analytics', function ($modal, $analytics) {

        this.openDialog = function (assets) {

            if (!Array.isArray(assets)) {
                assets = [assets];
            }

            // Don't open the download dialog if no assetIds were provided.
            if (assets.length === 0) {
                return;
            }

            $analytics.eventTrack('Open Viewer', { category: 'Zip Introspection', label: assets[0].fileName });
            var modalHandler = $modal.open({
                templateUrl: '/Scripts/app/components/zipintrospector/views/zip-details.tpl.html',
                controller: 'ZipController',
                size: 'sm',
                resolve: {
                    assetId: function() {
                        return assets[0].assetId;
                    },
                    assetName: function() {
                        return assets[0].fileName;
                    }
                }
            });
        };
    }]);
})();

(function() {
    'use strict';

    var module = angular.module('fmc.transfers');

    module.controller('RepushModalController', ['$scope', '$http', '$modalInstance', 'checkedIds', 'refreshTransfers', function ($scope, $http, $modalInstance, checkedIds, refreshTransfers) {
        var repushUrl = '/api/transfers/repush';
        $scope.isLoading = false;
        $scope.isPostComplete = false;
        $scope.message = 'Repush selected assets?';

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.closeModal = function() {
            refreshTransfers();
            $modalInstance.dismiss('cancel');
        };

        $scope.repushOnClick = function () {
            var requestData = {};
            requestData.autoDownloaderRequestIds = [];

            for (var key in checkedIds) {
                if (checkedIds[key] === true) requestData.autoDownloaderRequestIds.push(parseInt(key));
            }

            if (requestData.autoDownloaderRequestIds.length > 0) {
                $scope.isLoading = true;
                $http.post(repushUrl, requestData).then(function(response) {
                    $scope.isLoading = false;
                    $scope.isPostComplete = true;
                    $scope.message = 'Success! The items have been repushed';
                }, function(response) {
                    $scope.message = 'An error has occured trying to repush the assets. ' + response;
                });
            }
        }
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.delete');

    module.controller('DeleteAssetsCtrl',['$rootScope', '$scope', '$http', '$state', '$timeout', 'deleteAssetService', 'closeDeleteAssetsDialog', 'collectionAssets', '$window', 'SimpleHistoryService',
        function($rootScope, $scope, $http, $state, $timeout, deleteAssetService, closeDeleteAssetsDialog, collectionAssets, $window, SimpleHistoryService) {
            var deleteAsset = {
                assetsToDelete: []
            };

            var load = function() {
                $scope.assetsToDelete = deleteAsset.assetsToDelete;
                $scope.buttontext = "Yes Delete";
                $scope.started = false;
            };

            var init = function() {
                if (collectionAssets) {
                    _.each(collectionAssets, function(asset) {

                        if (!_.contains(deleteAsset.assetsToDelete, asset)) {
                            deleteAsset.assetsToDelete.push(asset);

                            if (asset.searchedAsset.permissions.deleteAsset === false) {
                                $scope.error = true;
                                $scope.errorMessage = "You dont have rights to delete asset. Delete Unsuccessful.";
                                $scope.hidebutton = false;
                                $scope.hideDeleteCancelButton = false;

                            }
                        };

                    });
                }

                load();
            };

            $scope.submitted = false;
            $scope.errorMessage = "";

            $scope.closeModal = function() {
                closeDeleteAssetsDialog();
            };

            $scope.hasError = function() {
                return $scope.errorMessage && $scope.errorMessage.length > 0;
            };

            $scope.hideDeleteCancelButton = true;
            $scope.deletesuccess = false;
            $scope.success = false;
            $scope.hidebutton = true;
            $scope.error = false;

            $scope.delete = function() {
                $scope.errorMessage = "";
                $scope.hideDeleteCancelButton = false;
                $scope.deletesuccess = false;
                $scope.buttontext = "Deleting";
                $scope.started = true;

                var assets = $scope.assetsToDelete.map(function(asset) {
                    return { assetId: asset.assetId };
                });

                return deleteAssetService.deleteassets(assets)
                    .then(function(response) {
                        $scope.submitted = true;

                        if (response.data.success === true) {
                            $scope.hideDeleteCancelButton = false;
                            $scope.success = true;
                            $scope.buttontext = "Deleted";
                            $scope.hidebutton = false;
                            $scope.deletesuccess = true;
                        }
                    });
            };

            $scope.closepopup = function() {
                closeDeleteAssetsDialog();
                var previousPage = SimpleHistoryService.backHistory();
                if (previousPage) {
                    previousPage.data.useCache = false;
                    $state.go(previousPage.routeName, previousPage.data);
                } else {
                    $state.go('home');
                }
            }

            init();
        }
    ]);
})();
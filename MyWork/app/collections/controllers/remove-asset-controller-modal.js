(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('RemoveCtrl',
        ['$rootScope', '$scope', '$state', '$timeout', '$stateParams','CollectionService', 'closeRemoveAssetfromCollectionDialog', 'collectionAssets', '$window',
    function ($rootScope, $scope, $state, $timeout, $stateParams, CollectionService, closeRemoveAssetfromCollectionDialog, collectionAssets, $window) {
        $scope.submitted = false;
        $scope.errorMessage = "";

        $scope.loadingCollections = true;

        $scope.request = {
              assets: collectionAssets
        }

        var init = function () {
            loadData();
            $scope.collectionId = $stateParams.id;
        };

        var loadData = function () {
           
            $scope.buttontext = "Yes Remove";
                
        };

        $scope.closeModal = function () {
            closeRemoveAssetfromCollectionDialog();
        };

        $scope.hasError = function () {
            return $scope.errorMessage && $scope.errorMessage.length > 0;
        };
        $scope.hideDeleteCancelButton = true
        $scope.removeSuccess = false;
        $scope.Success = false;
        $scope.hidebutton = true;
        $scope.started = false;


        $scope.remove = function () {
            $scope.errorMessage = "";
            $scope.submitted = true;
            $scope.hideDeleteCancelButton = false;
            $scope.buttontext = "Removing";
            $scope.started = true;
            

            var assets = $scope.request.assets.map(function (asset) {
                return { assetId: asset.assetId, filename: asset.assetName };
            });
                
                    CollectionService.removeAssetsFromCollection($scope.collectionId, assets)
                    .then(function () {
                        $scope.Success = true;
                        $scope.removeSuccess = true;
                        $scope.hidebutton = false;
                        $scope.hideDeleteCancelButton = false;
                      });
        };
        $scope.submitted = true;

        $scope.closepopup = function () {

            closeRemoveAssetfromCollectionDialog();
            $window.location.reload();
        }
                                              
        init();
    }]);
})();
                      
          
            
            

        

        
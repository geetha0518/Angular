(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.controller('CollectionFormController', ['$scope', '$modalInstance','$timeout','$state', 'AssetMetadataService','CollectionService',
        function ($scope, $modalInstance, $timeout,$state, AssetMetadataService, CollectionService) {

            $scope.selectedPolicy = undefined;
            $scope.collectionName = "";
            $scope.collectionDescription = "";
            $scope.resultFound = true;
            $scope.hasError = false;
            $scope.isCollectionTitleUnique = true;
            $scope.addButtonMessage = "Add";
            $scope.errorMessage = "Something has gone wrong. Please contact support.";
            $scope.processing = false;
            $scope.maxNameLength = 128;
            $scope.maxDescriptionLength = 500;
            var titleValidationDelay = 500;
            var policyValidationDelay = 300;
           
            $modalInstance.opened.then(function () {
                AssetMetadataService.getSecurityPolicies().then(function (data) {
                   $scope.securityPolicies = _.map(data, function (item) {
                                return { policyId : item.id , policyName :item.name   }
                        });
                });

            });

            $scope.closeModal = function () {
                $modalInstance.close();
            };

            var timeoutPromise;

            $scope.checkCollectionName = function () {

                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                    $scope.isCollectionTitleUnique = true;
                }

                timeoutPromise = $timeout(function () {

                    if ($scope.collectionName) {

                    var collectionTitle = $scope.collectionName.trim().replace(/\s\s+/g, ' ');;
                    $scope.hasError = false;
                    $scope.addButtonMessage = "Add";
                        
                    CollectionService.validateCollectionTitle(collectionTitle).then(
                          function (response) {
                              if (response.data === 'true') {
                                  $scope.isCollectionTitleUnique = true;
                              }else{
                                  $scope.isCollectionTitleUnique = false;
                              }
                          },
                          function (data) {
                              $scope.isCollectionTitleUnique = true;
                          }
                          );

                    }
                  

                }, titleValidationDelay);

            };


            var timeoutPolicyPromise;
            $scope.checkSecurityPolicy = function () {
               
                if (timeoutPolicyPromise) {
                    $timeout.cancel(timeoutPolicyPromise);
                    $scope.resultFound = true;
                }

                timeoutPolicyPromise = $timeout(function () {
                    $scope.hasError = false;
                    $scope.addButtonMessage = "Add";
                    if (typeof $scope.selectedPolicy === 'string' && !$scope.selectedPolicy) {
                        $scope.resultFound = true;
                        return;
                    }

                    if (!$scope.selectedPolicy.policyId) {
                        $scope.resultFound = false;
                    }
                }, policyValidationDelay);

            };

            $scope.onPolicySelected = function ($item, $model, $label) {
                $scope.resultFound =  true;
            };

            $scope.createCollection = function () {

                var collectionTitle = $scope.collectionName.trim().replace(/\s\s+/g, ' ');

                var collectionData = {};
                collectionData.Title = collectionTitle;
                
                if ( $scope.collectionDescription ) {
                    collectionData.Description =  $scope.collectionDescription;
                }   else{
                    collectionData.Description= "";
                }
                 
                if ($scope.selectedPolicy && $scope.selectedPolicy.policyId) {
                    collectionData.PolicyId = $scope.selectedPolicy.policyId;
                } else {
                    collectionData.PolicyId = "";
                }

                $scope.addButtonMessage = "Processing, please wait";
                $scope.processing = true;
                CollectionService.createCollection(collectionData).then(
                    function (response) {
                        $scope.addButtonMessage = "Collection succesfully added";
                        $timeout(function () {
                            
                            $state.go('help').then(function () {
                                $state.go('collections');
                                $scope.closeModal();
                                $scope.processing = false;
                            });
                        }, 2000);
                },
                 function (response) {
                     $scope.addButtonMessage = "Failure";
                     $scope.processing = false;
                     $scope.hasError = true;
               });
        
            };
           
        }]);

   
})();

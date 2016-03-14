(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('CollectionNotificationModalController',
        ['$rootScope', '$scope', '$timeout', 'CollectionService', 'closeNotificationDialog', 'selectedCollections',
    function ($rootScope, $scope, $timeout, CollectionService, closeNotificationDialog, selectedCollections) {
        //flag to indicate wheter notification is send, in order to  manipulate popup uttons
        $scope.notifiactionSent = false;
        //flag to mark sending proces, request->response
        $scope.isSendingProcess = false;
        $scope.errorMessage = "";
        $scope.collections = selectedCollections;

        //closes notification pop with small delay.
        function closePopupWithDelay() {
            $timeout(function () {
                $scope.closeModal();
            }, 400);
        }
        
        //gets "done" button text based on state.
        $scope.doneButtonText = function() {
            return $scope.hasError() ? "Close" : "Done";
        }

        //gets "notify" button text based on state
        $scope.notfyButtonText = function() {
                        if (!$scope.notificationSent && !$scope.isSendingProcess) {
                return "Notify";
            }
            else if (!$scope.notificationSent && $scope.isSendingProcess) {
                return "Sending";
            } else {
                return "Sent";
            }
        }

        //getting only collectioids from source array
        $scope.request = {
            CollectionIds: _.map(selectedCollections, function (item) {
                return item.collectionId;
            })
        }
        
        //closes modal
        $scope.closeModal = function () {
            closeNotificationDialog();
        };
        
        //indicates whether scope has error message to show
        $scope.hasError = function () {
            return $scope.errorMessage && $scope.errorMessage.length > 0;
        };

        
        //notification action handler.
        $scope.Notify = function () {
            $scope.errorMessage = "";
            $scope.submitted = true;
            $scope.notificationSent = false;
            $scope.isSendingProcess = true;

            return CollectionService.notifyCollectionUsers($scope.request)
                .then(function(response) {
                    $scope.notificationSent = eval(response.data);
                    closePopupWithDelay();
                }, function(response) {
                    //temporary error message, maybe must be replaced with one which makes more sense 
                    $scope.errorMessage = response.statusText;
                  
                }).finally(function() {
                    $scope.isSendingProcess = false;
                });
        };


    }]);
})();
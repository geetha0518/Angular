(function () {
    'use strict';

    var module = angular.module('fmc.videostream');

    module.controller('VideoStreamCtrl', ['$scope', 'closeDialog', 'modalData', 'streamPreview',
        function($scope, closeDialog, modalData, streamPreview) {
            $scope.closeModal = function() {
                closeDialog();
            };

            $scope.modalData = modalData;

            $scope.$on('streamReceived', function() {
                streamPreview($scope.modalData);
            });
        }
    ]);
})();
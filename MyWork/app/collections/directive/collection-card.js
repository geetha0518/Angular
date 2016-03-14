(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.directive('collectionCard', ['$state', function ($state) {
        return {
            restrict: 'E',
            controller: function () {
                this.goToController = function (collectionid) {
                    this.goToCollection = function (collectionId) {
                        $state.go('collection-assets', {
                            id: collectionId
                        });
                    };
                };
            },
            templateUrl: '/Scripts/app/collections/views/collection-card.tpl.html'
        };
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.directive('addAssetsToCollectionResponse', [function () {
        return {
            restrict: 'E',
            controller: function ($scope) {
                var selected = _.sortBy($scope.selectedCollections(), function (item) {
                    return item.title;
                });

                $scope.addedAssetCount = $scope.request.assets.length;
                $scope.addedCollectionCount = selected.length;

                $scope.firstHalf = _.take(selected, Math.ceil(selected.length / 2));
                $scope.secondHalf = _.rest(selected, Math.ceil(selected.length / 2));
            },
            templateUrl: '/Scripts/app/collections/views/add-assets-to-collection-response.tpl.html'
        };
    }]);
})();

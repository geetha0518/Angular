(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.directive('addAssetsToCollectionChoose', ['$filter', function ($filter) {
        return {
            restrict: 'E',
            scope: true,
            controller: function ($scope) {
                $scope.filterText = '';

                $scope.titleContainsFilterText = function (collection) {
                    if ($scope.filterText === '') {
                        return true;
                    }

                    var needle = $scope.filterText.toLowerCase();
                    var haystack = collection.title.toLowerCase();

                    var result = haystack.indexOf(needle) !== -1;
                    return result;
                }

                $scope.availableCollectionsCount = function () {
                    var count = 0;

                    _.each($scope.request.collections, function (collection) {
                        if ($scope.titleContainsFilterText(collection)) {
                            count++;
                        }
                    });

                    return count;
                }

                $scope.hoverTitle = function (asset) {
                    var title = asset.fileName;
                    if (asset.uploadedOn) {
                        title += "\n\n";
                        title += "Date Uploaded: " + $filter('date')(asset.uploadedOn, 'MM/dd/yyyy');
                    }
                    return title;
                }

                $scope.removeAsset = function (asset) {
                    asset.selected = false;

                    $scope.request.assets = _.filter($scope.request.assets, function (item) {
                        return item.assetId !== asset.assetId;
                    });
                }
            },
            templateUrl: '/Scripts/app/collections/views/add-assets-to-collection-choose.tpl.html'
        };
    }]);
})();

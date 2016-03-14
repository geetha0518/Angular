(function () {
    'use strict';

    var module = angular.module('fmc.components');
    
    module.directive("bulkAction", ["CollectionService", "ExportToFileService", function (CollectionService, ExportToFileService) {
        return {
            restrict: 'E',
            scope: {
                item: '=',
                enabled: '=',
                icon: '@',
                label: '@',
                assets: '=',
                type: '@'
            },
            require: '^actionBar',
            transclude: true,
            replace: true,
            templateUrl: '/Scripts/app/components/asset-stage/views/bulk-action-button.tpl.html',
            controller: function ($scope, $element) {

                var getSelectedAssets = function () {
                    return _.filter($scope.assets, function (asset) {
                        return asset.selected;
                    });
                };

                $element.click(function () {
                    var selectedAssets = getSelectedAssets();

                    if (selectedAssets.length > 0) {
                        switch ($scope.type) {
                            case 'addCollection':
                                CollectionService.addAssetsToCollectionDialog(selectedAssets);
                                break;
                            case 'viewPdf':
                                ExportToFileService.exportToContactSheet(selectedAssets);
                                break;
                            
                }
                    }
                });

            },
            compile: function (element, attrs, ctrl) {
                // if enable attrs is not provided we are defaulting to true 
                if(!attrs.enabled) {
                    attrs.enabled = 'true';
                }
            }
           
        };
    }]);
})();

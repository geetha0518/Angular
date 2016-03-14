(function () {
    'use strict';

    var module = angular.module('fmc.components');

    var registerTableHeader = function (name, template) {
        module.directive(name, [function () {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: '/Scripts/app/components/user-experiences/views/' + template,
                scope: true,
            };
        }]);
    }

    registerTableHeader('ficTableHeader', 'fic/fic-table-header.tpl.html');
    registerTableHeader('fmcTableHeader', 'fmc/fmc-table-header.tpl.html');
    registerTableHeader('foxSportsTableHeader', 'fox-sports/fox-sports-table-header.tpl.html');

    var registerTableRow = function (name, template) {
        var module = angular.module('fmc.components');

        module.directive(name, ['CollectionService', 'paneManager', 'LabelService', function (CollectionService, paneManager, LabelService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: '/Scripts/app/components/user-experiences/views/' + template,
                link: function (scope, element, attrs) {
                    scope.showAddAssetsToCollectionDialog = function () {
                        CollectionService.addAssetsToCollectionDialog(scope.asset);
                    };

                    scope.hasRestrictions = function () {
                        return scope.dataItem.usageRestrictions && scope.dataItem.usageRestrictions.length > 0;
                    };

                    scope.hasRevisions = function () {
                        return (scope.dataItem.version > 1 || scope.dataItem.revision > 0);
                    };

                    scope.collectionNames = function () {
                        return _.map(scope.dataItem.collections, function (item) {
                            return item.title;
                        }).join(', ');
                    };

                    scope.conditionalClass = function () {
                        // TODO: Something strange is happening with scope.hasRestrictions. It isn't accessible here.
                        // This makes it available here. Maybe it has something to do with this stuff being in the link function?
                        var hasRestrictions = function () {
                            return scope.dataItem.usageRestrictions && scope.dataItem.usageRestrictions.length > 0;
                        };

                        if (scope.dataItem.selected && !hasRestrictions()) {
                            return 'unrestricted';
                        }

                        if (hasRestrictions()) {
                            return 'restricted';
                        }

                        return "";
                    };

                    scope.showDetail = function () {
                        if (scope.clientUser.permissions.assetViewMetadata) {
                            paneManager.toggleRight(true, scope.asset);
                        }
                    };

                    scope.getFoxSportsLabel = function (sport) {
                        var foxSportsLabel = LabelService.getFoxSportsLabel(sport);
                        return foxSportsLabel;
                    };

                    element.on('$destroy', function () {
                        scope.asset = null;
                    });
                }
            };
        }]);
    };

    registerTableRow('ficTableRow', 'fic/fic-table-row.tpl.html');
    registerTableRow('fmcTableRow', 'fmc/fmc-table-row.tpl.html');
    registerTableRow('foxSportsTableRow', 'fox-sports/fox-sports-table-row.tpl.html');
})();

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

    registerTableHeader('transfersTableHeader', 'transfers/transfers-table-header.tpl.html');

    var registerTableRow = function (name, template) {
        var module = angular.module('fmc.components');

        module.directive(name, ['CollectionService', 'paneManager', 'LabelService', function (CollectionService, paneManager, LabelService) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: '/Scripts/app/components/user-experiences/views/' + template,
                link: function (scope, element, attrs) {
                    scope.showDetail = function () {
                        if (scope.clientUser.permissions.assetViewMetadata) {
                            paneManager.toggleRight(true, scope.asset);
                        }
                    };

                    element.on('$destroy', function () {
                        scope.asset = null;
                    });
                }
            };
        }]);
    };

    registerTableRow('transfersTableRow', 'transfers/transfers-table-row.tpl.html');

})();

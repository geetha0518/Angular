(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('transferStatus', ['LabelService', function (LabelService) {
        return function (term) {
            return LabelService.getTransferStatusLabels(term);
        };
    }]);
})();
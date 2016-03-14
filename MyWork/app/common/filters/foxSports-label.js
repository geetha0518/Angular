(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('foxSportsLabel', ['LabelService', function (LabelService) {
        return function (term) {
            return LabelService.getFoxSportsLabel(term);
        };
    }]);
})();
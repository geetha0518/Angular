(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('displayName', ['FieldService', function (FieldService) {
        return function(fieldId) {            
            return FieldService.displayName(fieldId);
        };
    }]);
})();
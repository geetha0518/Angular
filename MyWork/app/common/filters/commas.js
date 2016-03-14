(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('commas', ['$window', function ($window) {
        return function(number) {            
            if (!number) {
                return number;
            }
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };
    }]);
})();

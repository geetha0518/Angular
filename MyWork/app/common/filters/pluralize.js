(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('pluralize', ['$window', function ($window) {
        return function(word, count, includeCount) {            
            return $window.pluralize(word, count, includeCount);
        };
    }]);
})();
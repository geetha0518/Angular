(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('shorten', ["$window", function ($window) {
        return function(word, length, tail) {            
            if (!word || word.length <= length) return word;
            var shortened = word.substring(0, length) + " ... ";
            if (tail) {
                shortened += word.substring(word.length - tail);
            } 
            return shortened;
        };
    }]);
})();

(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('searchBarSuggestion', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/Scripts/app/components/search-bar/views/search-bar-suggestion.tpl.html',
            scope: true,
            link: function(scope, element, attrs) {                   
            }
        };
    }]);
})();
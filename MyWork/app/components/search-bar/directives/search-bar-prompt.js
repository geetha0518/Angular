(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('searchBarPrompt', [function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/Scripts/app/components/search-bar/views/search-bar-prompt.tpl.html',
            scope: true,
            link: function (scope, element, attrs) {
                scope.hasMultipleResults = function () {
                    // TODO: refer to resultsLimit defined above.
                    return scope.prompt.suggestions.length > 3;
                }

                scope.getSuggestions = function (suggestions) {
                    var suggestions = _.first(suggestions, scope.suggestionDisplayLimit);
                    return suggestions;
                }
            }
        };
    }]);
})();

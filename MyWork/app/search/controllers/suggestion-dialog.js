(function() {
    'use strict';

    var module = angular.module('fmc.search');

    module.controller('SuggestionDialogController', ['$scope', '$rootScope', 'searchBoxName', 'prompts', 'currentSearchTerms', 'closeDialog',
    function ($scope, $rootScope, searchBoxName, prompts, currentSearchTerms, closeDialog) {
        $scope.searchBoxName = searchBoxName;
        $scope.prompts = prompts;
        
        // define a unique identifier for each suggestion across all prompt groups.
        var hashSuggestions = function (suggestion) {
            var hash = suggestion.field + '_' + suggestion.term;
            return hash;
        };

        // build an easy look up of prompts by term properties.
        var suggestionLookup = {};
        _.each($scope.prompts, function (prompt) {
            _.each(prompt.suggestions, function (suggestion) {
                suggestionLookup[hashSuggestions(suggestion)] = suggestion;
            });
        })

        // mark each suggestion currently in the searchbox as selected
        _.each(currentSearchTerms, function (suggestion) {
            var suggestion = suggestionLookup[hashSuggestions(suggestion)];
            // Some terms currently in the search box will have come from previous
            // prompts and won't appear in our current suggestion list.
            if (suggestion) {
                suggestion.selected = true;
            }
        });

        $scope.applyFilters = function () {
            var selected = getSelectedSuggestions();
            $rootScope.$broadcast('add-search-term', $scope.searchBoxName, selected);

            $scope.closeModal();
        }

        $scope.closeModal = function() {
            closeDialog();
        };

        var getSelectedSuggestions = function() {
            var selected = [];
            
            _.each($scope.prompts, function (prompt) {
                _.each(prompt.suggestions, function (suggestion) {
                    if (suggestion.selected) {
                        selected.push(suggestion);
                    }
                });
            });

            return selected;
        };
    }]);
})();

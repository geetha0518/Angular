(function() {
    'use strict';

    var module = angular.module('fmc.search');

    module.service('ViewSuggestionsService', ['$modal', function ($modal) {
        var modalHandler;

        // prompts: a list of groups of prompts
        // prompts = [{terms: []}, {terms: []}]
        // searchBoxName: a string, representing the name of the search box to broadcast suggestions to
        this.openSuggestionsDialog = function (prompts, searchBoxName, currentSearchTerms) {
            if (!Array.isArray(prompts)) {
                prompts = [prompts];
            }

            modalHandler = $modal.open({
                templateUrl: '/Scripts/app/search/views/view-suggestions-dialog.tpl.html',
                controller: 'SuggestionDialogController',
                size: 'sm',
                resolve: {
                    searchBoxName: function () {
                        return searchBoxName;
                    },
                    prompts: function () {
                        return prompts;
                    },
                    currentSearchTerms: function() {
                        return currentSearchTerms;
                    },
                    closeDialog: function() {
                        return function () {
                            if (modalHandler) {
                                modalHandler.close();
                            }
                        }
                    }
                }
            });
        };
    }]);
})();

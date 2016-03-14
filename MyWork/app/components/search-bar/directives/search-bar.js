(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('searchBar', ['$q', '$rootScope', '$timeout', 'AssetSearchService', 'AlertsService', 'SearchExperience',
    function ($q, $rootScope, $timeout, AssetSearchService, AlertsService, SearchExperience) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                // required.
                name: "@",
                button: '@',

                // optional.
                queryMinLength: '=?',
                queryDelay: '=?',
                resultsLimit: '=?',
                clearOnSubmit: '=?'
            },
            templateUrl: '/Scripts/app/components/search-bar/views/search-bar.tpl.html',
            link: function(scope, element, attrs) {
                scope.element = element;

                // Focus and dismissal
                element.bind('blur', function(e) {
                    hasFocus = false;
                });

                scope.hasButton = (typeof attrs.withButton !== 'undefined');
                scope.usePlusButton = (typeof attrs.plusButton !== 'undefined');
            },

            controller: function ($scope) {
                // Scope
                $scope.inputText = '';
                $scope.isLoading = false;
                $scope.tags = [];
                $scope.placeHolderText = SearchExperience.placeholderText($scope.name);
                // optional properties.
                $scope.queryMinLength = $scope.queryMinLength < 2 ? $scope.queryMinLength : 2;
                $scope.queryDelay = $scope.queryDelay || 500;
                $scope.resultsLimit = $scope.resultsLimit || 1000;
                $scope.clearOnSubmit = $scope.clearOnSubmit ? true : false;

                // Private
                var hasFocus = false;

                var initializeListeners = function() {
                    // Input change
                    $scope.$watch('inputText', inputChanged);
                };

                $scope.handleSubmit = function () {
                    if ($scope.prompts.length > 0) {
                        return;
                    }

                    // add "keyword" search that isn't tied to specific field
                    if ($scope.inputText.length >= $scope.queryMinLength) {
                        addKeyword($scope.inputText);
                    } else if ($scope.inputText.length === 0) {
                        submit();
                    }
                };

                var submit = function () {
                    // query is not long enough to add as a keyword search
                    if ($scope.tags.length === 0 && ($scope.inputText < $scope.queryMinLength) && $scope.inputText !== ' ') {
                       // AlertsService.modalAlert('Please provide a search term that is at least three characters long.');
                        return;
                    }

                    var searchTerms = _.map($scope.tags, function (tag) {
                        var searchTerm = {
                            field: tag.field,
                            displayField: tag.displayField,
                            term: tag.term,
                            displayTerm: tag.displayTerm
                        };
                        return searchTerm;
                    });

                    // submit search
                    $rootScope.$broadcast('search-submitted', searchTerms, $scope.name);
                    if ($scope.clearOnSubmit) {
                        $scope.tags = [];
                    }
                };

                var timeoutPromise;

                var inputChanged = function(value) {
                    hasFocus = true;

                    if ($scope.inputText.length >= $scope.queryMinLength) {
                        
                        if ($scope.queryDelay > 0) {
                            if (timeoutPromise) {
                            
                                $timeout.cancel(timeoutPromise);
                            }

                            timeoutPromise = $timeout(function() {
                                getSuggestions(value);
                            }, $scope.queryDelay);
                        } else {
                            getSuggestions(value);
                        }
                    } else {
                        $scope.isLoading = false;
                        resetPrompts();
                    }
                };

                var getSuggestions = function (inputText) {
                   
                    $scope.isLoading = true;

                    var fields = [
                        'FOX.FIELD.TITLE',
                        'FOX.FIELD.ASSETTYPE'
                    ];

                    // TODO(geluso): why is searchTerms passed to suggest?
                    $q.when(AssetSearchService.suggest(inputText, fields, $scope.searchTerms, $scope.resultsLimit))
                        .then(function (prompts) {
                            // We have focus, and relevant response?
                            if ($scope.inputText === inputText && hasFocus) {
                                // add suggestions to $scope so search-bar-popup updates them. 
                                $scope.prompts = prompts;
                            }

                            $scope.isLoading = false;
                        });
                };

                $scope.remove = function (index) {
                    $scope.tags.splice(index, 1);
                    $scope.pushTagsLeft();
                };

                $scope.addSuggestion = function (suggestion) {
                    if (isBrokenFicTerm(suggestion.field)) {
                        suggestion.term = suggestion.displayTerm;
                        suggestion.field = suggestion.field + "_NAME";
                        suggestion.displayField = suggestion.displayField + " Name";
                    }

                    $scope.tags.push(suggestion);
                    resetInput();
                };

                var isBrokenFicTerm = function (suggestField) {
                    var brokenFicTerms = [
                        "FOX.FIELD.FIC_SHOW",
                        "FOX.FIELD.FIC_SEASON",
                        "FOX.FIELD.FIC_EPISODE"
                    ];

                    return _.contains(brokenFicTerms, suggestField);
                };

                var addKeyword = function (keyword) {
                    var term = {
                        field: "SYSTEMX.KEYWORD",
                        displayField: "Keyword",
                        term: keyword,
                        displayTerm: keyword,
                        suggestion: {
                            field: "SYSTEMX.KEYWORD",
                            displayField: "Keyword",
                            term: keyword,
                            displayTerm: keyword
                        }
                    }

                    $scope.addSuggestion(term);
                }

                // Clears input text and refocuses input box.
                var resetInput = function () {
                    $scope.inputText = "";
                    $scope.pushTagsLeft();
                };

                $scope.pushTagsLeft = function () {
                    // use a timeout to allow angular time to complete it's lifecycle loop and add things to the page. 
                    // This function will execute once the event loops picks it up after angular is done.
                    $timeout(function () {
                        var elm = $scope.element.find(".flex-tags");
                        elm.scrollLeft(9999999);
                    }, 0);
                };

                var resetPrompts = function () {
                    $scope.prompts = [];
                };

                initializeListeners();
                 
                $rootScope.$on('add-search-term', function (e, name, suggestions) {
                    if ($scope.name === name) {
                        _.each(suggestions, function (suggestion) {
                            $scope.addSuggestion(suggestion);
                        });
                        submit();
                    }
                });

                $rootScope.$on('search-submitted', function () {
                    $scope.inputText = '';
                    $scope.tags = [];
                });
            },
        };
    }]);
})();
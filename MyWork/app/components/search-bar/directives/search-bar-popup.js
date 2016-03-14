(function () {
    'use strict';

    var module = angular.module('fmc.components');
    module.directive('searchBarPopup', ['$document', '$analytics', 'ViewSuggestionsService', function ($document, $analytics, ViewSuggestionsService) {
        var KEY_CODES = [8, 13, 38, 40];
        return {
            restrict: 'E',
            scope: {
                prompts: '=',
                addSuggestion: '=',
                searchBarName: '='
            },
            replace: true,
            templateUrl: '/Scripts/app/components/search-bar/views/search-bar-popup.tpl.html',
            link: function (scope, element, attrs, ctrl) {
                var dismissClickHandler = function(e) {
                    if (e.target.nodeName.toLowerCase() === "button" &&
                        e.target.type.toLowerCase() === "submit") {
                        // simulate an enter keypress
                        scope.keyHandler({which: 13});
                    } else if (element[0] !== e.target) {
                        scope.prompts = [];
                        scope.$digest();
                    }
                };

                // Keypress
                scope.$parent.element.on('keydown', scope.keyHandler);

                $document.bind('click', dismissClickHandler);

                // Cleanup
                scope.$on('$destroy', function () {
                    $document.unbind('click', dismissClickHandler);
                    scope.$parent.element.off('keydown', scope.keyHandler);
                });
            },
            controller: function($scope) {
                $scope.suggestionDisplayLimit = 3;

                $scope.prompts = [];
                $scope.activeIndex = -1; //default so nothing is selected
                $scope.suggestionCount = 0;

                $scope.isOpen = function () {
                    if ($scope.prompts) {
                        return $scope.prompts.length > 0;
                    }
                    return false;
                };

                $scope.openSuggestionsDialog = function (prompts) {
                    if (!_.isArray(prompts)) {
                        $analytics.eventTrack('Suggestion - View All', { category: 'Search', label: prompts.displayField });
                        prompts = [prompts];
                    }

                    ViewSuggestionsService.openSuggestionsDialog(prompts, $scope.searchBarName, $scope.searchTerms);
                };

                $scope.keyHandler = function(e) {
                    var keyCode = e.which;
 
                    // key relevant?
                    if (KEY_CODES.indexOf(keyCode) === -1) {
                        return;
                    }

                    if (keyCode === 8) { // backspace
                        var parent = $scope.$parent;
                        if (parent.inputText.length === 0 && parent.tags.length > 0) {
                            // remove the right-most tag.
                            parent.tags.pop();
                            parent.$apply();
                        }
                    } else if ((keyCode == 13) && $scope.activeIndex > -1) { // enter
                        $scope.select($scope.activeIndex);
                        e.preventDefault();     // prevents the search from being performed when enter is hit
                    } else if ((keyCode === 38) && ($scope.activeIndex > -1)) {  // up 
                        $scope.activeIndex--;
                    } else if ((keyCode === 40) && ($scope.activeIndex > -2)) { // down
                        if ($scope.activeIndex < $scope.totalVisibleSuggestions - 1) {
                            $scope.activeIndex++;
                        } else {
                            $scope.activeIndex = -1;
                        }
                    }

                    $scope.$digest();
                };

                $scope.select = function (index) {
                    if (!(index >= 0)) {
                        return;
                    }

                    var suggestion = getSuggestionAtIndex(index);
                    $analytics.eventTrack('Suggestion - Click', { category: 'Search', label:suggestion.value });
                    $scope.addSuggestion(suggestion);
                };

                var getSuggestionAtIndex = function (activeIndex) {
                    var result = null;
                    _.each($scope.prompts, function (prompt) {
                        _.each(prompt.suggestions, function (suggestion) {
                            if (suggestion.activeIndex === activeIndex) {
                                result = suggestion;
                                result.espritId = suggestion.espritId;
                            }
                        });
                    });

                    return result;
                };

                $scope.isActive = function (suggestion) {
                    return suggestion.activeIndex === $scope.activeIndex;
                };

                $scope.resetSuggestions = function () {
                    $scope.activeIndex = -1;
                    $scope.totalVisibleSuggestions = 0;
                };

                var updateSuggestions = function (prompts) {
                    if (prompts.length > 0) {
                        // Recompute visible suggestions.
                        $scope.totalVisibleSuggestions = mapVisibleSuggestions(prompts, $scope.suggestionDisplayLimit);

                        $scope.activeIndex = -1;
                        $scope.suggestionCount = _.reduce($scope.prompts, function (memo, item) {
                            return memo + item.suggestions.length;
                        }, 0);

                        // Figure out if we need to show the view all link, if there are ever more than three suggestions in one group.
                        $scope.showViewAll = false;
                        for (var i = 0; i < $scope.prompts.length; i++) {
                            if ($scope.prompts[i].suggestions.length > $scope.suggestionDisplayLimit) {
                                $scope.showViewAll = true;
                            }
                        }

                    } else {
                        $scope.resetSuggestions();
                    }
                };

                // We only display some number of suggestions for each group that comes back.
                // In order to select these suggestions with an arrow key we need to give the
                // visible suggestions their own unique index.
                //
                // If we receive this group of suggestions:
                // suggestions = [(a,b,c,d), (e,f), (g), (h,i,j,k,l,m,n,o,p ...)]
                //
                // Then we only show the first three from each group:
                // shown suggestions = [(a,b,c), (e,f), (g), (h,i,j)]
                //
                // And all items are assigned an activeIndex accoridng to how they visably appear:
                // a:0, b:1, c:2, d:undefined, e:3, f:4, g:5, h:6, i:7, j:8, k:undefined, l:undefined, m:undefined ...
                var mapVisibleSuggestions = function (prompts, displayLimit) {
                    var activeIndex = 0;
                    _.each(prompts, function (prompt) {
                        var groupCount = 0;
                        _.each(prompt.suggestions, function (suggestion) {
                            // assign visible terms an index for selection.
                            if (groupCount < displayLimit) {
                                groupCount++;
                                suggestion.activeIndex = activeIndex++;
                                // reset terms that aren't visible so they have no activeIndex.
                            } else {
                                suggestion.activeIndex = undefined;
                            }
                        });
                    });

                    // the activeIndex count gives us the total number of visible suggestions.
                    return activeIndex;
                };

                var init = function () {
                    $scope.$watch('prompts', function (prompts) {
                        if (prompts === []) {
                            $scope.resetSuggestions();
                        } else {
                            updateSuggestions(prompts);
                        }
                    });
                }

                init();
            }
        };
    }])
})();
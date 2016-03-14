(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('searchFilters', ['$rootScope', '$location', '$window', '$analytics', 'paneManager', 'AssetSearchService', 'LabelService', 
    function ($rootScope, $location, $window, $analytics, paneManager, AssetSearchService, LabelService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                searchParams: '='
            },
            templateUrl: '/Scripts/app/components/search-filters/views/search-filters.tpl.html',
            controller: function($scope) {
                return {
                    setDateError: function (hasDateError) {
                        $scope.hasDateError = hasDateError;
                    }
                };
            },
            link: function (scope, element, attrs) {
                // always update the navigators when the page first loads.
                scope.shouldUpdateInitialNavigators = true;
              
                scope.allExpanded = false;
                scope.navigators = [];
                scope.filtersByField = {};
                scope.panes = paneManager;
               
                // display collection for selected filters, categorized by field
                // this is re-built each time the selections change
                var addCategorizedFilterByField = function(filter) {
                    var field = filter.field;
                    var fieldGroup = scope.filtersByField[field];

                    if (!fieldGroup) {
                        fieldGroup = scope.filtersByField[field] = {
                            displayField: filter.displayField,
                            field: filter.field,
                            filters: {}
                        };
                    }

                    fieldGroup.filters[filter.term] = filter;
                };

                /*
                 * On-click in the header (in template) the checkExpanded function
                 * gets called. If all accordion groups are expanded, then we change
                 * the label in the href to 'collapse all' else, do nothing.
                 * *keepgoing variable is added because we can't break from a for each
                 *  loop in angularjs: http://stackoverflow.com/questions/13843972/angular-js-break-foreach
                 */
                scope.checkExpanded = function () {
                    var changeExpanded = true;
                    var keepgoing = true;
                    _.each(scope.navigators, function (item) {
                        if (keepgoing && !item.isExpanded) {
                            changeExpanded = false;
                            keepgoing = false;
                        }
                    });
                    scope.allExpanded = changeExpanded;
                };

                scope.formatSortSpecial = function (term) {
                    switch (term.field) {
                        case 'FOX.FIELD.FXSP_TAG_VERSION':
                            return LabelService.getTagVersionLabel(term.value);
                        case 'FOX.FIELD.FXSP_EVENT_DATE':
                            return new Date(term.value.slice(0, 10));
                        case 'FOX.FIELD.FXSP_SPORT_KIND':
                            return LabelService.getFoxSportsLabel(term.value);
                        default:
                            return term.value;
                    }
                }

                scope.sortReverse = function(navigator) {
                    return navigator.field === 'FOX.FIELD.FXSP_EVENT_DATE';
                }

                scope.toggleNavigatorExpanded = function () {
                    scope.allExpanded = !scope.allExpanded;

                    _.each(scope.navigators, function (item) {
                        item.isExpanded = scope.allExpanded;
                    });

                };

                scope.searchTermToggled = function(term, navigatorField) {
                    scope.activeTerm = term.value;
                    if (!term.isChecked) {
                        
                        // find the filter based on term
                        var filterToBeRemoved = _.find(scope.searchParams.filters, function (filter) {
                            return filter.term === term.value;
                        });
                      
                        // remove the filter
                        if (filterToBeRemoved !== undefined) {
                            scope.searchParams.filters = _.filter(scope.searchParams.filters, function (filter) {
                                var isActive = filter.field === filterToBeRemoved.field && filter.term === filterToBeRemoved.term;                                
                                return !isActive;
                            });
                        }
                       
                    } else {
                        var filterValue = navigatorField + ":" + term.value;
                        $analytics.eventTrack('Filter', { category: 'Search' , label: filterValue});
                    }
                    
                    scope.refreshFilters();
                    
                };
                           
                scope.activeTermCount = function (navigator) {
                    var total = _.reduce(navigator.terms, function (memo, term) {
                        if (term.isChecked) {
                            return memo + 1;
                        } else { 
                            return memo;
                        }
                    }, 0);

                    return total;
                };

                scope.firstStatus = function () {
                    _.each(scope.navigators, function (item) {
                        if (scope.activeTermCount(item) > 0) {
                            item.isExpanded = true;
                        } else {
                            item.isExpanded = false;
                        }
                    });
                };
                

                scope.newFilterCount = function () {
                    // there are zero new filters if we do't have searchParams yet.
                    if (!scope.searchParams || scope.searchParams === {}) {
                        return 0;
                    }

                    var total = 0;
                    var currentTerms = scope.allTerms();

                    var removedTerms = _.filter(scope.initialTerms, function (term) {
                        return !_.contains(currentTerms, term);
                    });

                    var newTerms = _.filter(currentTerms, function (term) {
                        return !_.contains(scope.initialTerms, term);
                    });

                    total = newTerms.length + removedTerms.length;

                    // TODO: figure out how to figure in hasdateerror
                    if (!scope.hasDateError && scope.searchParams.dateUploadedRange &&
                         scope.searchParams.dateUploadedRange.start &&
                         scope.searchParams.dateUploadedRange.end) {
                        if (scope.initialDateUploadedStart !== scope.searchParams.dateUploadedRange.start) {
                            total++;
                        }

                        if (scope.initialDateUploadedEnd !== scope.searchParams.dateUploadedRange.end) {
                            total++;
                        }
                    }

                    return total;
                };

                //Clear date controls and reset search results
                scope.clearDates = function () {
                    if (scope.searchParams.dateUploadedRange.start || scope.searchParams.dateUploadedRange.end) {
                        scope.searchParams.dateUploadedRange.start = null;
                        scope.searchParams.dateUploadedRange.end = null;
                        scope.refreshFilters();
                    }
                };

                scope.refreshFilters = function () {
                    scope.initialTerms = scope.allTerms();
                    scope.initialDateUploadedStart = scope.searchParams.dateUploadedRange.start;
                    scope.initialDateUploadedEnd = scope.searchParams.dateUploadedRange.end;
                    scope.searchParams.eventDate = [];

                    var filters = scope.navigatorsToFilters();
                   
                    // Angular adds pesky "$$hash" properties to objects in scopes. We use this map
                    // to get all the searchParam.filters without that property. This prevents
                    // duplicate filters from appearing in the list.
                    scope.searchParams.filters = _.map(scope.searchParams.filters, function(filter) {
                        return {
                            field: filter.field,
                            term: filter.term,
                            displayField: filter.displayField,
                            displayTerm: filter.displayTerm
                        };
                    });
                    
                    _.each(filters, function (filter) {
                        // Event Date is a filter but need to be handled as Date Range
                        if (filter.field === "FOX.FIELD.FXSP_EVENT_DATE") {
                            scope.searchParams.eventDate.push(filter.term);
                        }
                        // add filters only if they are not have been added already
                        else {
                            var haystack = scope.searchParams.filters;
                            var needle = {
                                field: filter.field,
                                term: filter.term
                            };
                           
                            var identicalFilters = _.where(haystack, needle);
                            if (identicalFilters.length === 0) {
                                $analytics.eventTrack('Add Keyword', { category: 'Search' });
                                scope.searchParams.filters.push(filter);
                                addCategorizedFilterByField(filter);
                            }
                        }
                    }); 
                   
                    // Params contains every key value pair that will be added to the URL.
                    // Changes are collected in the params object and only actually modify
                    // the $location.search value once. This prevents stateParamsChanges
                    // from firing more than once.
                    var params = {}
                    //removing date filters to avoid duplicate search terms
                    var dateFilteredSearchParams = AssetSearchService.removeDateFilters(scope.searchParams.filters);
                    params.filters = angular.toJson(dateFilteredSearchParams);
                    // Remove the date range search parameters if no date range is specified.
                    if (!scope.searchParams.dateUploadedRange.start && !scope.searchParams.dateUploadedRange.end && !scope.searchParams.eventDate) {
                        delete params.dateFilters;
                    } else if ((scope.searchParams.dateUploadedRange.start || scope.searchParams.dateUploadedRange.end) && scope.searchParams.eventDate) {
                        var start = scope.searchParams.dateUploadedRange.start;
                        var startDate = null;
                        if (start) {
                            var parsedDateStart = Date.parse(start);
                            startDate = new Date(parsedDateStart);
                        }

                        var end = scope.searchParams.dateUploadedRange.end;
                        var endDate = null;
                        if (end) {
                            var parsedDateEnd = Date.parse(end);
                            endDate = new Date(parsedDateEnd);
                        }
              
                        params.dateFilters = [];
                      
                        var dateImportedFilter = angular.toJson(
                                 {
                                     displayField: "Upload Date",
                                     field: "ARTESIA.FIELD.DATE_IMPORTED",
                                     start: startDate,
                                     end:endDate ,
                                     endOperator: "LE"
                                 }
                        );
                        params.dateFilters.push(dateImportedFilter);
                                               
                        _.each(scope.searchParams.eventDate, function (eventDate) {
                            var eventDateFilter = angular.toJson(
                                {
                                    displayField: "Event Date",
                                    field: "FOX.FIELD.FXSP_EVENT_DATE",
                                    start: new Date(eventDate),
                                    end: new Date(eventDate),
                                    endOperator: "LE"
                                }
                            );
                            params.dateFilters.push(eventDateFilter);
                        });
                    } else if ( (scope.searchParams.dateUploadedRange.start || scope.searchParams.dateUploadedRange.end) && !scope.searchParams.eventDate) {
                        var start = scope.searchParams.dateUploadedRange.start;
                        if (!start) {
                            // provide a default start date.
                            start = scope.minUploadedDate;
                        }
                        var end = scope.searchParams.dateUploadedRange.end;
                        if (!end) {
                            // provide a default end date.
                            end = scope.maxUploadedDate;
                        }

                        params.dateFilters = angular.toJson(
                            [{
                                displayField: "Upload Date",
                                field: "ARTESIA.FIELD.DATE_IMPORTED",
                                start: new Date(start),
                                end: new Date(end),
                                endOperator:"LE"
                            }]
                        );
                    } else if ((!scope.searchParams.dateUploadedRange.start || !scope.searchParams.dateUploadedRange.end) && scope.searchParams.eventDate) {
                        params.dateFilters = [];
                        _.each(scope.searchParams.eventDate, function (eventDate) {
                            var eventDateFilter = angular.toJson(
                                {
                                    displayField: "Event Date",
                                    field: "FOX.FIELD.FXSP_EVENT_DATE",
                                    start: new Date(eventDate),
                                    end: new Date(eventDate),
                                    endOperator: "LE"

                                }
                            );
                            params.dateFilters.push(eventDateFilter);
                        });
                    }

                    if ($location.search().sort) {
                        params.sort = $location.search().sort;
                    }

                    var jsonDateFilters = angular.toJson(params.dateFilters);
                    $location.search(params);
                };

                scope.refineSearch = function (searchTerms) {
                    _.each(searchTerms, function (searchTerm) {
                        if (searchTerm.field === "SYSTEMX.KEYWORD") {
                            addKeyword(searchTerm);
                        } else {
                            var term = scope.findOrAddTerm(searchTerm);
                            if (term) {
                                term.isChecked = true;
                            }
                        }
                    });

                    scope.allExpanded = false;
                    scope.refreshFilters();
                };

                scope.$on('search-submitted', function (ev, searchTerms, name) {
                    if (name === "left-pane-search") {
                        scope.refineSearch(searchTerms);
                        scope.activeTerm = searchTerms[0].term;
                    } else if (name === "navigation-search") {
                        scope.shouldUpdateInitialNavigators = true;
                        var json = angular.toJson(searchTerms);

                        paneManager.toggleLeft(true)

                    }
                });

                scope.allTerms = function () {
                    var terms = [];
                    _.each(scope.navigators, function (nav) {
                        _.each(nav.terms, function (term) {
                            if (term.isChecked) {
                                var identifier = nav.field + "|" + term.value;
                                terms.push(identifier);
                            }
                        });
                    });
                    return terms;
                };


                scope.findTerm = function (filter) {
                    var navigator = _.find(scope.navigators, function (navigator) {
                        return navigator.field == filter.field
                    });

                    if (navigator) {
                        return _.find(navigator.terms, function (term) {
                            return term.value == filter.term
                        });
                    }

                    return null;
                };


                scope.findOrAddTerm = function (filter) {
                    var prohibited = ["SYSTEMX.KEYWORD"];
                    if (_.contains(prohibited, filter.field)) {
                        return undefined;
                    }
                    
                    var navigator = _.find(scope.navigators, function (navigator) {
                        return navigator.field == filter.field
                    });

                    if (!navigator) {
                        navigator = {
                            field: filter.field,
                            terms: [],
                            totalResults: 0,
                            isExpanded: false
                        };

                        scope.navigators.push(navigator);
                    }

                    var term = _.find(navigator.terms, function (term) {
                        return term.value == filter.term
                    });

                    if (!term) {
                        term = filter;
                        term.isChecked = false;

                        navigator.terms.push(term);
                    }

                    return term;
                };

                var addKeyword = function (searchTerm) {
                    var identicalKeywordFilters =_.where(scope.searchParams.filters, searchTerm)

                    if (identicalKeywordFilters.length === 0) {
                        scope.searchParams.filters.push(searchTerm);
                        addCategorizedFilterByField(searchTerm);
                    }
                };

                               
                scope.$on('update-navigators', function (e, navigators) {
                    // Setup navigators
                    scope.allExpanded = false;
                    scope.navigators = [];
                                        
                    // only update Navigators if coming from search(new) bar or reload from browser
                    if (scope.shouldUpdateInitialNavigators) {
                        scope.shouldUpdateInitialNavigators = false;
                        updateNavigatorsWithoutActiveNavigator(navigators);
                    } else {
                        updateNavigators(navigators);
                    }

                    scope.allExpanded = false;
                    scope.navigators = _.sortBy(scope.navigators, function (navigator) {
                        return navigator.sortOrder;
                    });

                    _.each(scope.navigators, function (nav) {
                        _.each(nav.terms, function (term) {
                            term.displayField = nav.displayField;
                            term.field = nav.field;
                            term.displayTerm = term.value;
                            term.term = term.value;
                        });
                    })
                });

                var updateNavigatorsWithoutActiveNavigator = function (navigators) {
                   
                    _.each(navigators, function (navigator) {
                        setNavigatorTerms(navigator);
                        scope.navigators.push(navigator);
                    });
                    
                    scope.activeNavigators = scope.navigators;
                    scope.activeNavigator = scope.findActiveNavigator(navigators);
                };

                var updateNavigators = function(navigators) {
                    scope.activeNavigator = scope.findActiveNavigator(scope.activeNavigators, scope.activeTerm);

                    _.each(navigators, function (navigator) {
                        // active navigator
                        if (scope.activeNavigator && scope.activeNavigator.field &&
                            (navigator.field.toLowerCase() === scope.activeNavigator.field.toLowerCase())) {
                            // only update the active navigator if there are more incoming terms.
                            if (navigator.terms.length > scope.activeNavigator.terms.length) {
                                setNavigatorTerms(navigator);
                                scope.navigators.push(navigator);
                            // otherwise, read the unaltered active navigator.
                            } else {
                                // update the terms count for the active navigator to match that from returned service
                                _.each(scope.activeNavigator.terms, function (activeTerm) {
                                    var matchingTerm = _.find(navigator.terms, function (term) {
                                        return term.term === activeTerm.value;
                                    })
                                    if (matchingTerm !== undefined) {
                                        activeTerm.count = matchingTerm.count;
                                    }
                                });

                                scope.activeNavigator.isExpanded = false;
                                scope.navigators.push(scope.activeNavigator);
                            }
                        // always update all other navigators.
                        } else {
                            setNavigatorTerms(navigator);
                            scope.navigators.push(navigator);
                        }
                    });


                    // update activeNavigators
                    scope.activeNavigators = scope.navigators;
                };

                var setNavigatorTerms = function (navigator) {
                    navigator.isExpanded = false;
                    navigator.terms = _.map(navigator.terms, function (term) {
                        return {
                            value: term.term,
                            count: term.count,
                            isChecked: scope.termIsChecked(navigator.field, term.term)
                        };
                    });
                };

                scope.termIsChecked = function (field, term) {
                    var filter = _.find(scope.searchParams.filters, function (filter) {
                        return filter.field === field && filter.term.toLowerCase() === term.toLowerCase();
                    });

                    return filter !== undefined;
                };

                scope.findActiveNavigator = function (navigators, term) {
                    var activeNavigator = {};

                    if (term !== undefined) {
                        _.each(navigators, function (navigator) {
                            var found = _.findWhere(navigator.terms, { value: term});
                            if (found !== undefined) {
                                activeNavigator = navigator;
                            }
                        }); 
                    }
                    else {
                        _.each(navigators, function (navigator) {
                            var found = _.findWhere(navigator.terms, { isChecked: true });
                            if (found !== undefined) {
                                activeNavigator = navigator;
                            }
                        });
                    }

                    return activeNavigator;
                };

                scope.navigatorsToFilters = function () {
                    var filters = [];

                    _.each(scope.navigators, function (navigator) {
                        _.each(navigator.terms, function (term) {
                            if (term.isChecked) {
                                filters.push(term);
                            }
                        });
                    });

                    return filters;
                };

                scope.notNull = function (item) {
                    var nulls = [undefined, null, "null", "NULL"];
                    return !_.contains(nulls, item);
                };

                scope.removeFilter = function (searchFilter) {
                    scope.searchParams.filters = _.filter(scope.searchParams.filters, function(filter) {
                        if (filter.field === searchFilter.field && filter.term === searchFilter.term) {
                            return false;
                        } else {
                            return true;
                        }
                    });

                    var term = scope.findTerm(searchFilter);
                    if (term) {
                        term.isChecked = false;
                    }

                    scope.refreshFilters();
                }

                scope.isFoxSports = function (field) {
                    var foxSportsFields = [
                        'FOX.FIELD.FXSP_TAG_VERSION',
                        'FOX.FIELD.FXSP_EVENT_DATE',
                        'FOX.FIELD.FXSP_SPORT_KIND'
                    ];
                    return _.contains(foxSportsFields, field);
                };

                var init = function() {
                    scope.initialTerms = scope.allTerms();
                    scope.filtersByField = {};
                    scope.initialDateUploadedStart = scope.searchParams.dateUploadedRange.start;
                    scope.initialDateUploadedEnd = scope.searchParams.dateUploadedRange.end;

                    var keywords = _.filter(scope.searchParams.filters, function (term) {
                        return term.field === "SYSTEMX.KEYWORD";
                    })
                    _.each(keywords, function (keywordTerm) {
                        var term = scope.findOrAddTerm(keywordTerm);
                        if (term) {
                            term.isChecked = true;
                        }
                    });

                    _.each(scope.searchParams.filters, function(filter) {
                        addCategorizedFilterByField(filter);
                    });
                };

                $rootScope.$on('init-search-filters-pane', function (ev, searchParams) {
                    scope.searchParams = searchParams;
                    init();
                });

                $rootScope.$on('clear-search-filters-pane', function (ev) {
                    scope.searchParams = {};
                    scope.allExpanded = false;
                    scope.navigators = [];
                    scope.activeNavigators = [];
                    scope.shouldUpdateInitialNavigators = true;
                });
            }
        }
    }]);
})();

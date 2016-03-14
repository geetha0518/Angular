(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('AssetSearchService', ['$rootScope', '$http', '$q', '$analytics', 'DSCacheFactory',
    function ($rootScope, $http, $q, $analytics, DSCacheFactory) {
        this.defaultLimit = 50;

        var defaultParams = {
            dateUploadedRange: {
                field: "ARTESIA.FIELD.DATE_IMPORTED",
                start: '',
                end: '',
                endOperator: "LE"
            },
            filters: [],
            offset: 0,
            limit: this.defaultLimit,
            // default sort
            sort: {
                field: "ARTESIA.FIELD.DATE_IMPORTED",
                order: "desc"
            }
        };

        var minUploadedDate = new Date("1/1/1900");
        var maxUploadedDate = new Date();
              
        this.removeDateFilters = function ( filters ) {
            var filtered = [];
            _.each(filters, function (filter) {
                if (filter.field !== "FOX.FIELD.FXSP_EVENT_DATE") {
                    filtered.push(filter);
                }
            });

            return filtered;
        };

        var getDateFilters = function (dateUploadedRange, eventDateRange) {
            var dateFilters = [];
            var start, end;

            if ((dateUploadedRange && (dateUploadedRange.start || dateUploadedRange.end)) &&
                (eventDateRange && eventDateRange.length > 0)) {

                start = dateUploadedRange.start;

                if (!start) {
                    start = minUploadedDate;
                }

                end = dateUploadedRange.end;
                if (!end) {
                    end = maxUploadedDate;
                }

                var dateImportedFilter = {
                    field: "ARTESIA.FIELD.DATE_IMPORTED",
                    start: new Date(start),
                    end: new Date(end),
                    endOperator: "LE"
                }

                dateFilters.push(dateImportedFilter);

                _.each(eventDateRange, function (eventDate) {
                    var eventDateFilter = {
                        field: "FOX.FIELD.FXSP_EVENT_DATE",
                        start: new Date(eventDate.start),
                        end: new Date(eventDate.end),
                        endOperator: "LE"
                    }
                    dateFilters.push(eventDateFilter);
                });
            } else if (dateUploadedRange && (dateUploadedRange.start || dateUploadedRange.end)) {
                start = dateUploadedRange.start;

                if (!start) {
                    start = minUploadedDate;
                }

                end = dateUploadedRange.end;
                if (!end) {
                    end = maxUploadedDate;
                }

                dateFilters = [{
                    field: "ARTESIA.FIELD.DATE_IMPORTED",
                    start: new Date(start),
                    end: new Date(end),
                    endOperator: "LE"
                }];
            } else if (eventDateRange && eventDateRange.length > 0) {
                _.each(eventDateRange, function(eventDate) {
                    var eventDateFilter = {
                        field: "FOX.FIELD.FXSP_EVENT_DATE",
                        start: new Date(eventDate.start),
                        end: new Date(eventDate.end),
                        endOperator: "LE"
                    }

                    dateFilters.push(eventDateFilter);
                });
            }

            return dateFilters;
        };

        // public 
        this.defaultParams = function () {
            return defaultParams;
        };

        this.searchWithSearchParams = function (searchParams) {
            $rootScope.$emit('init-search-filters-pane', searchParams);
          
            var query = this.search(
                this.removeDateFilters(searchParams.filters),
                getDateFilters(searchParams.dateUploadedRange, searchParams.eventDateRange),
                searchParams.offset,
                searchParams.limit,
                searchParams.sort,
                searchParams.useCache
            );

            return query;
        };

        this.search = function (searchTerms, dateFilters, offset, limit, sort, useCache) {
            var defaultCache = useCache && useCache.toLowerCase() === 'false' ? false : DSCacheFactory.get('defaultCache');
            limit = limit ? limit : 20;

            var terms = _.map(searchTerms, function (searchTerm) {
                var field = "KEYWORD";
                if (searchTerm.field) {
                    field =searchTerm.field;
                }
                var query =  "field:"+field + ",term:" + searchTerm.term;
                return query;
            }).join(",");
            $analytics.eventTrack('New Search', { category: 'Search', label: terms });
            $rootScope.$emit('cancel-collection-requests', {});

            var request = $http.get('/api/search', {
                params: {
                    limit: limit,
                    offset: offset,
                    searchTerms: searchTerms,
                    sortTerms: sort,
                    dateFilters: dateFilters
                },
                cache: defaultCache
            });

            // view decorations
            request.success(function (response) {
                _.each(response.results, function (item) {
                    item.selected = false;
                });
            });

            return request;
        };

        this.suggest = function (inputText, fields, searchTerms, limit) {
            var defaultCache = DSCacheFactory.get('defaultCache');
            var defaultFields = [
                'FOX.FIELD.TITLE',
                'FOX.FIELD.FOX DIVISION',
                'FOX.FIELD.ASSETTYPE',
                'FOX.FIELD.SUBASSETTYPE',
                'FOX.FIELD.FOXTERRITORY',
                'FOX.FIELD.WPR ID'
            ];
            var deferred = $q.defer();

            var requestUrl = '/api/Search/Suggest/';
            var request = $http.get(requestUrl, {
                params: {
                    searchText: inputText,
                    fields: fields || defaultFields,
                    searchTerms: searchTerms || [],
                    limit: limit || 20
                },
                cache: defaultCache
            });

            request.success(function (categories) {
                if (categories && categories instanceof Array) {
                    // add a sequential index across all terms so we can use
                    // up and down arrow keys in suggestion popup.
                    var index = 0;

                    _.each(categories, function (category) {
                        _.each(category.suggestions, function (suggestion) {
                            suggestion.index = index++;
                        });
                    });

                    deferred.resolve(categories);
                } else {
                    deferred.reject();
                }
            });

            request.error(function () {
                deferred.reject();
            });

            return deferred.promise;
        };
    }]);
})();

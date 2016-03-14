(function () {
    'use strict';

    var module = angular.module('fmc.search');

    module.controller('AssetSearchController', ['$scope', '$rootScope', '$http', '$state', '$location', '$window', '$filter', '$analytics', '$timeout',
        'getStateParams', 'AssetSearchService', 'SortOptionsService', 'SessionService', 'gridOptions',
        'paneManager', 'DownloadManager', 'DownloadFactory', 'ClientUserService',
    function ($scope, $rootScope, $http, $state, $location, $window, $filter, $analytics, $timeout,
            getStateParams, AssetSearchService, SortOptionsService, SessionService, gridOptions,
            paneManager, DownloadManager, DownloadFactory, ClientUserService) {
        var defaultSearchParams = {
            dateUploadedRange: {
                field: "ARTESIA.FIELD.DATE_IMPORTED",
                start: '',
                end: ''
            },
            filters: [],
            offset: 0,
            limit: AssetSearchService.defaultLimit,
            sort: {
                field: "ARTESIA.FIELD.DATE_IMPORTED",
                order: "desc"
            }
        };

        $scope.defaultLimit = function () {
            return AssetSearchService.defaultLimit;
        };

        // Scope
        $scope.searchParams = {};
        $scope.assets = [];
        $scope.totalResults = 0;
        $scope.selectedRows = [];
        $scope.showSort = true;

        $scope.permissions = ClientUserService.getCurrentUser().permissions;
        $scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;
        $scope.isFic = ClientUserService.isFic;
       
        // Initializing response to avoid error creating table before results have arrived.
        $scope.response = {
            results: [],
            totalResults: 0
        }

        /// =======================================================================
        /// Action Bar Events and specific binders
        /// TODO: move to better location or encapsulate into asset-stage directive structure
        //
        var allSelected = false;
        $scope.toggleAllSelected = function () {
            allSelected = !allSelected;

            _.each($scope.assets, function (asset) {
                asset.selected = allSelected;
            });
        };

        //Addition for ESX-1617
        $scope.selectAll = function () {
            $analytics.eventTrack('Select All', { category: 'Action Bar' });
            _.each($scope.assets, function (asset) {
                asset.selected = true;
            });

            $timeout(function () { $scope.$broadcast('select-all-assets'); }, 0);
        };

        $scope.deselectAll = function () {
            _.each($scope.assets, function (asset) {
                asset.selected = false;
            });

            $timeout(function () { $scope.$broadcast('deselect-all-assets'); }, 0);
        };
       //End addition

        $scope.$on('asset-grid-view', function (event, args) {
            $scope.showSort = false;
        });

        $scope.$on('asset-tile-view', function (event, args) {
            $scope.showSort = true;
        });

        $scope.getSelectedAssets = function () {
            return _.filter($scope.assets, function (asset) {
                return asset.selected;
            });
        };

        $scope.openDownloadDialog = function () {
            var assets = $scope.getSelectedAssets();

            if (assets.length > 0) {
                DownloadManager.newModal(assets);
            }
        };

        $scope.sortChange = function (sort) {
            $location.search('sort', angular.toJson(sort));
        };

        $scope.sortOptions = SortOptionsService.sortOptions;
        $scope.pageLimit = AssetSearchService.defaultLimit;

        $scope.paginationModel ={ currentPage: 1 };

        $scope.pageUpdate = function (page) {
            allSelected = false;
            $location.search('offset', angular.toJson((page - 1) * AssetSearchService.defaultParams().limit));
        };

        ///
        /// End TODO: move to better location or encapsulate into asset-stage directive structure
        /// =======================================================================

        // Private
        var init = function () {
            $scope.$on('$locationChangeSuccess', stateParamsChanged);

            var savedState = SessionService.get('user-left-open', true);

            paneManager.toggleLeft(savedState);
            paneManager.registerLeftCallback(function (open) {
                SessionService.set('user-left-open', open);
            });

            // Check if query state needs to be restored
            var filters;

            if ($location.search().filters) {
                filters = JSON.parse($location.search().filters);
            }

            // including 'all' in the URL will allow the search engine to avoid
            // restoring the query state and perform a search for all available assets.
            if (_.isEmpty(filters) && !$location.search().all) {
                var lastSearch = SessionService.get('last-search-url');
                if (lastSearch) {
                    $location.url(lastSearch, true);
                }
            } else {
                stateParamsChanged();
            }

            $scope.paginationModel.currentPage = 1 + ($scope.searchParams.offset / $scope.pageLimit);
        };


        var stateParamsChanged = function () {
            if (!$scope.lastLocation || $scope.lastLocation !== $location.url()) {

                $scope.lastLocation = $location.url();

                // This work around is required because UI Router does not currently support dynamic parameters
                // Everything should go through the URL and corresponding events
                var newStateParams = getStateParams(); 

                $scope.searchParams = {};
                $scope.searchParams = _.defaults(newStateParams, defaultSearchParams);
                $scope.searchParams.filters = angular.fromJson($scope.searchParams.filters);

                $scope.searchParams.sort = angular.fromJson($scope.searchParams.sort);
                $scope.searchParams.offset = angular.fromJson($scope.searchParams.offset);

                // Remove UI properties that shouldn't be sent to the server.
                if ($scope.searchParams.sort.displayName) {
                    delete $scope.searchParams.sort.displayName;
                }

                if ($scope.searchParams.sort.selected) {
                    delete $scope.searchParams.sort.selected;
                }

                // We must clone from the defaultSearchParams so the default values aren't overwritten.
                $scope.searchParams.dateUploadedRange = _.clone(defaultSearchParams.dateUploadedRange);

                var dateFilters = angular.fromJson($scope.searchParams.dateFilters);
                if (dateFilters && !Array.isArray(dateFilters)) {
                    dateFilters = [dateFilters];
                }
                $scope.searchParams.eventDateRange = [];

                _.each(dateFilters, function (dateFilter) {
                    if (typeof dateFilter === "string") {
                        dateFilter = angular.fromJson(dateFilter);
                    }

                    if (dateFilter.field === "ARTESIA.FIELD.DATE_IMPORTED") {
                        $scope.searchParams.dateUploadedRange = _.defaults(dateFilter, defaultSearchParams.dateUploadedRange);
                        $scope.searchParams.dateUploadedRange.start = dateFilter.start || "";
                        $scope.searchParams.dateUploadedRange.end = dateFilter.end || "";
                    }

                    if (dateFilter.field === "FOX.FIELD.FXSP_EVENT_DATE") {
                        $scope.searchParams.eventDateRange.push(dateFilter);

                        // Using https://docs.angularjs.org/api/ng/filter/date
                        // This is to match when term will be toggled 
                        var termDate = new Date(dateFilter.start);
                        var formattedDate = $filter('date')(termDate, 'MM/dd/yyyy') + ' 00:00:00';
                        var eventDataFilter = { field: 'FOX.FIELD.FXSP_EVENT_DATE', term: formattedDate };
                        $scope.searchParams.filters.push(eventDataFilter);
                    }
                });

                search();
            } else if ($scope.lastLocation && $scope.lastLocation === $location.url()) { 
                return;
            }
        };

        var search = function () {
            $scope.loadingSearchResults = true;
            $scope.assetLookup = {};

            var search = AssetSearchService.searchWithSearchParams($scope.searchParams);

            search.success(function (result) {
                $scope.response = result;
                $scope.totalResults = result.totalResults;
                $scope.assets = $scope.response.results;

                _.each($scope.assets, function (asset) {
                    asset.uploadedOn = asset.uploadedOn.substring(0, asset.uploadedOn.lastIndexOf(':')) + '00';
                    asset.selected = false;
                    $scope.assetLookup['' + asset.assetId] = asset;
                });

                $rootScope.$broadcast('update-navigators', $scope.response.navigators);
                $timeout(function() { $rootScope.$broadcast('new-assets'); }, 0);

                // Cache search parameters
                SessionService.set('last-search-url', $location.url());
            });

            search.finally(function () {
                $scope.paginationModel.currentPage = 1 + ($scope.searchParams.offset / $scope.pageLimit);
                $scope.loadingSearchResults = false;
            });
        };
        
        // Init
        init();
    }]);
})();

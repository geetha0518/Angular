// TODO: this file requires significant refactor. Too complex. Too many things going on.
(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('CollectionAssetsController',
        ['$scope', '$rootScope', '$state', '$stateParams', '$location', '$modal', '$filter', '$analytics','$log','$timeout',
         'getStateParams', 'gridOptions', 'AssetSearchService', 'CollectionService', 'SessionService',
         'SortOptionsService', 'paneManager', 'DownloadFactory', 'DownloadManager', 'LabelService', 'ClientUserService',
    function ($scope, $rootScope, $state, $stateParams, $location, $modal, $filter, $analytics,$log, $timeout,
              getStateParams, gridOptions, AssetSearchService, CollectionService, SessionService,
              SortOptionsService, paneManager, DownloadFactory, DownloadManager, LabelService, ClientUserService) {

        $scope.permissions = ClientUserService.getCurrentUser().permissions;
        $scope.isACollectionOwner = ClientUserService.getCurrentUser().isACollectionOwner;
        $scope.isFic = ClientUserService.isFic;
        $scope.showSort = true;
        // This variable protects us from loading our initial data more than once.
        var firstSearchFinished = false;
        var filters_init = 0;

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
        
        var init = function () {
            $scope.searchParams = angular.copy(defaultSearchParams);
            $scope.collectionId = $stateParams.id;

            $scope.$on('$locationChangeSuccess', stateParamsChanged);

            // Save the open state of the left pane for each different collection-detail pane.
            // We use the collection id as a unique key.
            var sessionKey = 'user-left-open/collection-details/' + getStateParams().id;

            // Get any saved pane state, or use a default state.
            var defaultState =true;
            var savedState = SessionService.get(sessionKey, defaultState);
            paneManager.toggleLeft(savedState);

            // We save the state of the left pane with the unique session key each time the pane is toggled.
            var saveLeftOpen = function(open) {
                SessionService.set(sessionKey, open);
            };
    
            /*Reset Accordion state on initialization EFMCC-171 */
            SessionService.setKeyPattern('groupkey', false);
            SessionService.setKeyPattern('expandAll', false);

            paneManager.registerLeftCallback(saveLeftOpen);

            getData();

            $rootScope.$broadcast('clear-search-filters-pane');

            $rootScope.$on('cancel-collection-requests', function (evt) {
                if (CollectionService) {
                    CollectionService.cancelPendingRequests();
                }
                filters_init = 0;
            });
        };

        // Scope
        $scope.showSpinner = false;
        $scope.assets = [];
        $scope.groupedAssets = {};
        $scope.assetLookup = {};
        $scope.assetPage = 1;
        $scope.loadingDetails = true;
        $scope.loadingAssets = true;
        $scope.totalPages = 0;
        $scope.maxAssetsPerPage = 20;

        $scope.enableRemoveAsset = function () {
            return $scope.getSelectedAssets().length > 0
                && !$scope.loadingAssets;
        };
        $scope.enableAddAsset = function () {
            return $scope.getSelectedAssets().length > 0
                && !$scope.loadingAssets;
        };
        $scope.enableViewPDF = function () {
            return $scope.getSelectedAssets().length > 0
                && !$scope.loadingAssets;
        };
        $scope.enableDownloadAssets = function () {
            return $scope.permissions.assetDownload
                && $scope.getSelectedAssets().length > 0
                && !$scope.loadingAssets
                && $scope.collection.membersCanDownload;
        };

        var resetState = function () {
            $scope.assets = [];

            //reseting assets page along with aother values.
            $scope.assetPage = 1;

            CollectionService.cancelPendingRequests();
            filters_init = 0;
            if (getStateParams()) {
                $scope.collectionId = getStateParams().id;
            }
        };

        var getData = function () {
            var startTime = Date.now();
            $log.log('loading collections... ');
            $scope.loadingAssets = true;

            var errorCallback = function () {
                $state.go('collections');
                $scope.loadingAssets = false;
            };

            loadData().then(function (response) {
                var endTimeFirstLoad = Date.now();
                $log.log('collection service response in ' + (endTimeFirstLoad - startTime) + " milliseconds");

                loadDataSuccess(response.data);
                loadAssets().then(function (loadAssetsData) {

                    loadAssetsSuccess(loadAssetsData.data);
                    var endTime = Date.now();
                    $log.log('total collection time:  ' + (endTime - startTime) + " milliseconds");
                    $scope.collapseAll();
                }, errorCallback);
            });
        };

        var loadData = function () {
            return CollectionService.getCollection($scope.collectionId);
        };

        var loadDataSuccess = function (response) {
            if (!response) {
                return;
            }

            $scope.collection = {
                name: response.title,
                description: response.description,
                createDate: response.createDate,
                isFavorite: response.isFavorite,
                isAutodownloaderEnabled: response.isAutodownloaderEnabled, 
                isOwner:  response.isOwner,
                assetCount: response.assetCount,
                memberCount: response.memberCount,
                membersCanDownload: response.allowMemberDownload,
                isCollectionAssetsGrouped: response.isCollectionAssetsGrouped
            };
            
            $scope.collection.owners = _
                .filter(response.members, function (data) { return data.role.toLowerCase() !== "member"; })
                .map(function (data) { return data.displayName; }).join(", ");

            // Configure Page Title to include Collection title for SimpleHistory to have a better title to display
            $state.$current.data.pageTitle = $state.$current.data.pageTitlePrefix + " - " + response.title;

            $scope.loadingDetails = false;
        };

        var groupAssets = function () {
            var groupResults = _.groupBy($scope.assets, function (asset) {
                return asset.sport;
            });

            var groupedAssetsInit = _.map(groupResults, function (value, key) {
                // groups default to being not open.
                //TODO
                var sessionGroupKey = $scope.collectionId + '-' + key + '-groupkey';
                var isOpen = SessionService.get(sessionGroupKey, false);
                // but we restore the value of isOpen if the group has been grouped and opened before.
                if ($scope.groupedAssets) {
                    var group = _.find($scope.groupedAssets, function (g) {
                        return g.groupName === key;
                    });

                    if (group) {
                        isOpen = group.isOpen || false;
                    }
                }

                var groupName = key === 'null' ? "Uncategorized" : LabelService.getFoxSportsLabel(key);

                return {
                    groupId: key,
                    groupName: groupName,
                    assets: value,
                    isOpen: isOpen
                };
            });

            $scope.groupedAssets = _.sortBy(groupedAssetsInit, function (group) {
                return group.groupName;
            });
            // setup accordion global state event reception
            groupState($scope.groupedAssets);
        };

        var loadAssets = function (assetPage, extParams) {

            assetPage = (assetPage) ? assetPage : 1;

           var requestParams = {
                offset: ((assetPage - 1) * $scope.maxAssetsPerPage),
                limit: $scope.maxAssetsPerPage,
                sortTerms: $scope.sortOption,
                searchTerms: $scope.searchParams.filters,
                dateFilters: $scope.searchParams.dateFilters
            };

            $rootScope.$emit('init-search-filters-pane', $scope.searchParams);

            return CollectionService.getCollectionAssets($scope.collectionId, requestParams);
        };

        var loadAssetsSuccess = function (response) {
            if (!response) {
                return;
            }

            //$scope.assets = $scope.assets.concat(response.results);
            Array.prototype.push.apply($scope.assets, response.results);
            $scope.$broadcast('assets-added');

            $scope.totalResults = response.totalResults;
            $scope.totalPages = Math.ceil($scope.totalResults / $scope.maxAssetsPerPage);

            if ($scope.collection.isCollectionAssetsGrouped) {
                groupAssets();
            }

            _.each($scope.assets, function (asset) {
                // ensure the assetId keys is always a string.
                $scope.assetLookup['' + asset.assetId] = asset;
             });

            if (filters_init === 0) {
                $rootScope.$broadcast('update-navigators', response.navigators);
                filters_init++;
            }
            $scope.showSpinner = true;
            $scope.assetCountLabel = $scope.assets.length +' of ';
            
            if ($scope.assetPage < $scope.totalPages) {
                $scope.assetPage++;
                //JavaScript doesn't have tail call elimination 
                var startTime = Date.now();
                loadAssets($scope.assetPage, {}).then(function (loadResponse) {
                    if (loadResponse) {
                        var endTime = Date.now();
                        $log.log('total collection time:  ' + (endTime - startTime) + " milliseconds");
                        loadAssetsSuccess(loadResponse.data);
                    }
                });

            } else {
                $scope.assetCountLabel = "";
                $scope.assetPage = 1;
                $scope.showSpinner = false;
            }

            $scope.loadingAssets = false;
            firstSearchFinished = true;
        };

        /// =======================================================================
        /// Action Bar Events and specific binders
        /// TODO: move to better location or encapsulate into asset-stage directive structure
        ///

        // Keeps track of whether all assets should be toggle true or false.
        // Also determines initial checked state of all checkboxes.
        $scope.allSelected = false;
        $scope.toggleSelected = function () {
            $scope.allSelected = !$scope.allSelected;
            _.each($scope.assets, function (asset) {
                asset.selected = $scope.allSelected;
            });
        };
       
        //Addition for ESX-1617
        $scope.selectAll = function () {
            $analytics.eventTrack('Select All', { category: 'Action Bar' });
            _.each($scope.assets, function (asset) {
                asset.selected = true;
            });

            $timeout(function() { $scope.$broadcast('select-all-assets'); }, 0);
        };

        $scope.deselectAll = function () {
            _.each($scope.assets, function (asset) {
                asset.selected = false;
            });

            $timeout(function () { $scope.$broadcast('deselect-all-assets'); }, 0);
        };
        //End addition

        $scope.getSelectedAssets = function () {
            return _.filter($scope.assets, function (asset) {
                return asset.selected;
            });
        };

        // for bulk action control
        $scope.openDownloadDialog = function () {
            var assets = $scope.getSelectedAssets();

            if (assets.length > 0) {
                DownloadManager.newModal(assets);
            };
        };

        $scope.removeAssetsFromCollection = function () {


            var assets = $scope.getSelectedAssets();
            CollectionService.removeAssetsFromCollectionDialog(assets);
            
        };

        $scope.openCreateCategoryDialog = function () {
            var modal = $modal.open({
                templateUrl: '/Scripts/app/collections/views/category.tpl.html',
                resolve: {
                    },
                controller: function ($scope, $modalInstance) {
                    // Hard coding for the demo 
                    $scope.metadataFields = ['File Name', 'File Type', 'Asset Type', 'Promo Code', 'Sport', 'Tag Version', 'Promo Start Date'];

                    $scope.createCategory = function (selectedMetaDataField) {
                        // apply the grouping logic here
                        $modalInstance.close();
                    };

                    $scope.closeCreateCategoryDialog = function () {
                        $modalInstance.close();
                    };
                }
            });
        }

        $scope.sortChange = function (sortOption) {
            resetState();
            $scope.sortOption = sortOption;
            $scope.loadingAssets = true;

            loadAssets().then(function (results) {
                loadAssetsSuccess(results.data);
            });
        }

        $scope.sortOptions = SortOptionsService.sortOptions;
        $scope.sortOption = SortOptionsService.defaultSort;

        ///
        /// End TODO: move to better location or encapsulate into asset-stage directive structure
        /// =======================================================================

        var stateParamsChanged = function () {
            // Only react to parameters being changes after the first search has finished.
            // This prevents multiple searches from being executed when the page first loads.
            if (!firstSearchFinished) {
                return;
            }

            resetState();

            var url = $location.url();
            if ($scope.lastLocation && $scope.lastLocation === url) {
                return;
            }

            $scope.lastLocation = url;

            // This work around is required because UI Router does not currently support dynamic parameters
            // Everything should go through the URL and corresponding events
            var newStateParams = getStateParams();

            // TODO(geluso): prevent this funciton from firing when navigating away from the page.
            if (newStateParams === null) {
                return;
            }

            $scope.searchParams = {};
            $scope.searchParams = _.defaults(newStateParams, defaultSearchParams);
            $scope.searchParams.searchTerms = angular.fromJson($scope.searchParams.filters);
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
            $scope.searchParams.eventDateRange = [];
            _.each(dateFilters, function (filter) {
                var dateFilter = angular.fromJson(filter);
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
            
            $rootScope.$emit('init-search-filters-pane', $scope.searchParams);

            getData();
        };

        // receive watch messages on global state of groups in accordion:
        var groupState = function (groupArray) {
            $scope.$on('accordionIsolateIsOpen', function (event, data) {
                var sessionGroupKey = $scope.collectionId + '-' + data.groupId + '-groupkey';
                SessionService.set(sessionGroupKey, data.isOpen);

                var i = 0;
                var state = true;

                for (i in groupArray) {
                    state = state && groupArray[i].isOpen;
                }
                var expandAllKey = $scope.collectionId + '-expandAll';
                SessionService.set(expandAllKey, state);
                $scope.expandAll = state;
            });
        };


        // to expand/collapse accordion:
        $scope.toggleExpand = function () {
            var expandAllKey = $scope.collectionId + '-expandAll';
            var expandAllValue = SessionService.get(expandAllKey, false);
          
            $scope.expandAll = !expandAllValue;
            $rootScope.$broadcast('assets-expand-all', $scope.expandAll);
            SessionService.set(expandAllKey, $scope.expandAll);

            angular.forEach($scope.groupedAssets, function (item) {
                var sessionGroupKey = $scope.collectionId + '-' + item.groupId + '-groupkey';
                SessionService.set(sessionGroupKey, $scope.expandAll);
                item.isOpen = $scope.expandAll;
            });
        };

        $scope.collapseAll = function () {
            var expandAllKey = $scope.collectionId + '-expandAll';
            SessionService.set(expandAllKey, false);
            $scope.expandAll = false;
            
            angular.forEach($scope.groupedAssets, function (item) {
                var sessionGroupKey = $scope.collectionId + '-' + item.groupId + '-groupkey';
                SessionService.set(sessionGroupKey, $scope.expandAll);
                item.isOpen = $scope.expandAll;
            });
        };

        $scope.$on('asset-grid-view', function (event, args) {
            $scope.showSort = false;
        });

        $scope.$on('asset-tile-view', function (event, args) {
            $scope.showSort = true;
        });

        init();
    }]);
})();

(function () {
    'use strict';

    var module = angular.module('fmc.transfers');

    module.controller('TransfersController',
        ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$location', '$modal',
         'getStateParams', 'gridOptions', 'TransferRecordService', 'LabelService', 'ClientUserService',
         '$interval', '$log', '$analytics', 
    function ($scope, $rootScope, $http, $state, $stateParams, $location, $modal,
              getStateParams, gridOptions, TransferRecordService, LabelService, ClientUserService, $interval, $log, $analytics) {

        $scope.loadingTransfers = true;
        $scope.searchBoundary = 500;
        $scope.currentPage = 1;
        $scope.pageSize = 50;
        $scope.sortReverse = false;
        $scope.sortType = "statusDateTime"; // set the default sort type
        $scope.checkedIds = {};
        $scope.user = ClientUserService.getCurrentUser();

        var intervalController;
        var gridColumns = [
            { field: "filename", title: "Filename", width: "300px" },
            { field: "transactionId", title: "Transaction Id", width: "150px" },
            { field: "submittedBy", title: "Submitted By" },
            { field: "submittedDate", title: "Submitted Date/Time" },
            { field: "status", title: "Status" },
            { field: "statusDate", title: "Status Updated On" },
            { field: "deliveredTo", title: "Delivered To" }
        ];

        // only add the repush header if the user has permissions
        if ($scope.user.permissions.foxSportsRepush) {
            gridColumns.unshift({ field: "id", title: " ", /*headerTemplate: "<input type='checkbox' ng-click='selectAllOnClick($event)' style='margin-left:2px' />", */ width: "50px", sortable: false, filterable: false });
        }

        $scope.transfersGrid = {
            loaded: false,
            options: gridOptions('transfersRowTemplate', gridColumns,
                {
                    sortable: true,
                    pageable: true,
                    scrollable: true,
                    resizable: true,
                    serverSorting: true
                }
            )
        };

        var loadTransfers = function (transferPage, sortType, sortOrder) {
            var order = sortOrder ? 0 : 1;
            var fieldId = LabelService.getTransferFieldId(sortType);

            var requestParams = {
                offset: ((transferPage - 1) * $scope.searchBoundary),
                limit: $scope.searchBoundary,
                sortTerm: fieldId,
                sortOrder: order
            };
            return TransferRecordService.getRecords(requestParams);
        };

        var loadTransfersSuccess = function (response) {
            if (!response) {
                return;
            }

            $scope.assets = response.data.transfers;
            $scope.totalResults = response.data.totalTransfers;
            $scope.showSpinner = true;
            $scope.loadingTransfers = false;
            $scope.pageLoading = false;

            var transferCount = $scope.totalResults;

            $scope.transfersGrid.options.dataSource.data($scope.assets);

            // bind to collection members grid
            var transfersGrid = _.map(response.data.transfers, function (data) {
                return {
                    id : data.id.toString(),
                    assetId: data.assetId, 
                    filename: data.filename,
                    transactionId: data.transactionId, 
                    submittedBy: data.requestedByName, 
                    submittedDate: data.statusDateTime,
                    status: data.statusDescription,
                    statusDate: data.updateDateTime,
                    deliveredTo: data.destinationName
                };
            });

            $scope.transfersGrid.options.pageable = (function () {

                if (transferCount > $scope.pageSize) {
                    return {
                        pageSize: $scope.pageSize,
                        buttonCount: 5,
                        messages: {
                            previous: "Previous page",
                            next: "Next page"
                        }
                    };
                } else {
                    return false;
                }

            })($scope.pageSize);

            $scope.transfersGrid.options.dataSource.data(transfersGrid);
            $scope.transfersGrid.options.dataSource.sort({ field: "statusDate", dir: "desc" });
            $scope.transfersGrid.options.dataSource.pageSize($scope.pageSize);
            $scope.transfersGrid.options.dataSource.page($scope.currentPage);
            $scope.transfersGrid.options.loaded = true;

            $scope.loadingTransfers = false;
        };

        var errorCallback = function () {
            $state.go('help');
            $scope.loadingTransfers = false;
        };

        var getData = function () {
            $scope.loadingTransfers = true;
            loadTransfers($scope.currentPage, $scope.sortType, $scope.sortReverse).then(loadTransfersSuccess, errorCallback);

            TransferRecordService.loadTransferConfiguration().then(function (response) {

                var refreshTime = response.data.refreshTime;
                intervalController = $interval(function () {
                    $scope.pageLoading = true;
                    var date = new Date();
                    $scope.currentPage = $scope.transfersGrid.options.dataSource.page();
                    $log.info('reloading transfers page  by field ' + $scope.sortType + '  sortOrder ' + $scope.sortReverse + ' currentPage ' + $scope.currentPage + ' RefreshTime ' + refreshTime + ' timestamp ' + date);
                    loadTransfers(1, $scope.sortType, $scope.sortReverse).then(loadTransfersSuccess,errorCallback);

                }, refreshTime);
            });
        };

        var clearCheckedIds = function () {
            for (var key in $scope.checkedIds) {
                $scope.checkedIds[key] = false;
            }
        }

        $scope.stopInterval = function () {
            if (angular.isDefined(intervalController)) {
                $interval.cancel(intervalController);
                intervalController = undefined;
            }
        };

        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $scope.stopInterval();
        });

        $scope.viewAssetDetails = function (assetId, fileName) {
            $analytics.eventTrack('Detail Page', {
                category: 'Navigation', label: (fileName ? fileName : filename + '').substring(0, 450)
            });

            $state.go('asset-detail', {
                id: assetId
            });
        };

        $scope.isFailedTransfer = function (asset) {
            if (asset.status === 'FAILED' || asset.status === 'UNABLE TO PROCESS') {
                return true;
            } else {
                return false;
            }
        };

        $scope.selectAllOnClick = function (e) {
            var checkbox = e.target;

            var startIndex = ($scope.transfersGrid.options.dataSource.page() - 1) * $scope.transfersGrid.options.dataSource.pageSize();
            var data = $scope.transfersGrid.options.dataSource.data();
            for (var i = startIndex; i < $scope.transfersGrid.options.dataSource.pageSize() ; i++) {
                if (checkbox.checked) {
                    $scope.checkedIds[data[i].id] = true;
                } else {
                    $scope.checkedIds[data[i].id] = false;
                }
            }
        }

        $scope.areAnyAssetsChecked = function () {
            for (var key in $scope.checkedIds) {
                if ($scope.checkedIds[key] === true) return true;
            }

            return false;
        }

        $scope.openConfirmModal = function() {
            $modal.open({
                templateUrl: 'repushConfirmModal',
                controller: 'RepushModalController',
                size: 'sm',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    checkedIds: function() {
                        return $scope.checkedIds;
                    },

                    refreshTransfers: function() {
                        return function() {
                            clearCheckedIds();
                            $scope.currentPage = 1;
                            loadTransfers(1, $scope.sortType, $scope.sortReverse).then(loadTransfersSuccess, errorCallback);
                        };
                    }
                }
            });
        }

        getData();
    }]);
})();

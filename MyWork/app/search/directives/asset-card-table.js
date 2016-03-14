(function () {
    'use strict';

    var module = angular.module('fmc.search');

    /// Asset Card Table Directive
    /// This directive is a container directive, it does not rely on a parent element, however,
    /// it does expect that it's scope contains an array of assets. Which is needed for the 
    /// template to render accordingly.

    module.constant("gridDefinitions", {
        foxSports: [
            { title: ' ', width: 30, template: "<span ng-if='!isHomePage()' ng-class=\"{'mb-checkbox-disabled':disabled }\"><i class='mb' ng-class=\"{'mb-checkbox-white': !(dataItem.selected), 'mb-checkbox-green':(dataItem.selected), 'mb-checkbox-disabled':disabled }\"></i></span>"},
            { field: "assetName", title: "Asset", resizable: true, width: 300, template: '<a ng-if="userProfile.permissions.assetViewMetadata" ng-click="viewAssetDetails(dataItem)" title="{{ dataItem.assetName }}" class="previewlabel">{{ dataItem.assetName }}</a><span class="cant_view" ng-if="!userProfile.permissions.assetViewMetadata">{{ dataItem.assetName }}</span>' },
            { title: 'icons', width: 75 },
            { field: "collection", title: "Collection", filterable: false, sortable: false, width: 50, template: "<div ng-if='dataItem.collections.length > 0' title='{{ dataItem.collectionTitles }}'><i class='mb mb-collection'></i>{{dataItem.collections.length}}</div>" },
            { field: "assetType", title: "Asset Type", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "teamEvent", title: "Spot Name", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "promoCode", title: "Promo Code", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "sport", title: "Sport", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "tagVersion", title: "Tag Version", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "promoStartDate", title: "Start Date", width: 110, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' }, template: "{{ dataItem.promoStartDate === null ? '': (dataItem.promoStartDate | date:'MM/dd/yyyy') }}" },
            { field: "uploadedOn", title: "Upload Date", width: 115, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' }, template: "{{ dataItem.uploadedOn === null ? '' : (dataItem.uploadedOn | date:'MM/dd/yyyy') }}" },
            { field: "duration", title: "Duration", width: 98, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { title: "Actions", filterable: false, sortable: false, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "sportDisplayName", hidden: true, groupHeaderTemplate: "<div style='width:97%;display:inline-block;'><span style='float:right;padding-right:20px'>#= count # #: count === 1 ? 'asset' : 'assets' #</span><span>#= value #</span></div>" }
        ],
        fic: [
            { title: ' ', width: 30, template: "<span ng-if='!isHomePage()' ng-class=\"{'mb-checkbox-disabled':disabled }\"><i class='mb' ng-class=\"{'mb-checkbox-white': !(dataItem.selected), 'mb-checkbox-green':(dataItem.selected), 'mb-checkbox-disabled':disabled }\"></i></span>" },
            { field: "assetName", title: "Asset", resizable: true, width: 300,  template: '<a ng-if="userProfile.permissions.assetViewMetadata" ng-click="viewAssetDetails(dataItem)" title="{{ dataItem.assetName }}" class="previewlabel">{{ dataItem.assetName }}</a><span class="cant_view" ng-if="!userProfile.permissions.assetViewMetadata">{{ dataItem.assetName }}</span>' },
            { title: 'icons', width: 75, hidden: true },
            { field: "collection", title: "Collection", filterable: false, sortable: false, width: 75, attributes: { style: 'text-align:center' }, template: "<div ng-if='dataItem.collections.length > 0' title='{{ dataItem.collectionTitles }}'><i class='mb mb-collection'></i>{{dataItem.collections.length}}</div>" },
            { field: "ficShowName", title: "Title", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "ficSeasonName", title: "Season", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "ficEpisodeName", title: "Episode", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "ficVersionName", title: "Version", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "assetType", title: "Asset Type", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "ficIsoConformedLanguage", title: "ISO Conformed Language", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "ficIsoSubtitleLanguage", title: "ISO Subtitle Language", attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } },
            { field: "uploadedOn", title: "Upload Date", width: 115, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' }, template: "{{ dataItem.uploadedOn === null ? '' : (dataItem.uploadedOn | date:'MM/dd/yyyy') }}" },
            { title: "Actions", filterable: false, sortable: false, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } }
        ],
        fmc: [
            { title: ' ', width: 30, template: "<span ng-if='!isHomePage()' ng-class=\"{'mb-checkbox-disabled':disabled }\"><i class='mb' ng-class=\"{'mb-checkbox-white': !(dataItem.selected), 'mb-checkbox-green':(dataItem.selected), 'mb-checkbox-disabled':disabled }\"></i></span>" },
            { field: "assetName", title: "Asset", resizable: true, width: 450, template: '<a ng-if="userProfile.permissions.assetViewMetadata" ng-click="viewAssetDetails(dataItem)" title="{{ dataItem.assetName }}" class="previewlabel">{{ dataItem.assetName }}</a><span class="cant_view" ng-if="!userProfile.permissions.assetViewMetadata">{{ dataItem.assetName }}</span>' },
            { title: 'icons', width: 75 },
            { field: "collection", title: "Collection", filterable: false, sortable: false, width: 50, template: "<div ng-if='dataItem.collections.length > 0' title='{{ dataItem.collectionTitles }}'><i class='mb mb-collection'></i>{{dataItem.collections.length}}</div>" },
            { field: "title", title: "Title" },
            { field: "territory", title: "Terrritory", width: 200 },
            { field: "uploadedOn", title: "Upload Date", width: 115, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' }, template: "{{ dataItem.uploadedOn === null ? '' : (dataItem.uploadedOn | date:'MM/dd/yyyy') }}" },
            { title: "Actions", filterable: false, sortable: false, width: 100, attributes: { style: 'text-align:center' }, headerAttributes: { style: 'text-align:center' } }
        ],
        fieldTypes: {
            promoStartDate: { type: 'date' },
            uploadedOn: { type: 'date' }
        },
        filters: {
            extra: false,//do not show extra filters
            operators: {
                // redefine operators
                "date": {
                    //eq: "On", equals doesn't work correctly.  Need to figure out how to parse the date only and not factor in the time of day
                    lt: "Before",
                    gt: "After"
                },
                "int": {
                    eq: "Equals"
                },
                "string": {
                    eq: "Equals",
                    contains: "Contains"
                }
            }
        }
    });

    module.directive('assetCardTable', ['$state', '$analytics', 'filterFilter', 'ClientUserService', 'SessionService', 'ZipService', 'CollectionService', 'DownloadManager', 'paneManager', 'gridDefinitions',
        function ($state, $analytics, filter, ClientUserService, SessionService, ZipService, CollectionService, DownloadManager,paneManager, gridDefinitions) {
            return {
                restrict: 'EA',
                replace: true,
                templateUrl: '/Scripts/app/search/views/asset-card-table.tpl.html',
                scope: {
                    assets: '=',
                    gridHeight: '@',
                    isDisplayed: '@',
                    isGrouped: '=',
                    expandAll: '=',
                    filterable: '=',
                    sortable: '='
                },
                link: function (scope, element, attrs) {
                    var isVisible = scope.isDisplayed | false;
                    var isSortable = scope.sortable === null || scope.sortable === undefined ? true : scope.sortable;
                    var isFilterable = scope.filterable === null || scope.filterable === undefined ? true : scope.filterable;
                    scope.userProfile = ClientUserService.getCurrentUser();
                    scope.isFicUser = ClientUserService.isFic;
                    // set the grid columns based on the user
                    var columns;
                    if (scope.isFicUser) {
                        columns = gridDefinitions.fic;
                    } else if (ClientUserService.isFoxSports) {
                        columns = gridDefinitions.foxSports;
                    } else {
                        columns = gridDefinitions.fmc;
                    }

                    for (var i = 0; i < columns.length; i++) {
                        if (columns[i].title === 'icons') {
                            columns[i].template = $('#assetNameTemplate').html();
                            columns[i].title = ' ';
                        } else if (columns[i].title === 'Actions') {
                            columns[i].template = $('#assetActionsTemplate').html();
                        }
                    }

                    var showDetail = function (asset) {
                        if (scope.userProfile.permissions.assetViewMetadata) {
                            paneManager.toggleRight(true, asset);
                        }
                    };

                    var highlightRow = function (rowData) {
                        var gridHtml = $("#assetGrid tbody");

                        if (scope.hasRestrictions(rowData) || scope.hasRevisions(rowData) || rowData.selected) {
                            var uid = rowData.uid;
                            var row = gridHtml.find("tr[data-uid=" + uid + "]");
                            var cell = $(row.find("td")[scope.isGrouped ? 2 : 1]);

                            if (scope.hasRestrictions(rowData)) {
                                row.addClass("restricted");
                                cell.addClass("restricted");
                            }

                            if (scope.hasRevisions(rowData)) {
                                cell.addClass("revised");
                            }

                            if (rowData.selected) {
                                row.addClass("selected");
                            }
                        }
                    };

                    var gridDataBound = function(e) {
                        var dataView = this.dataSource.view();
                        for (var i = 0; i < dataView.length; i++) {
                            if (scope.isGrouped) {
                                if (!scope.expandAll) {
                                    this.collapseGroup('.k-grouping-row:contains(' + dataView[i].value + ')');
                                }

                                for (var j = 0; j < dataView[i].items.length; j++) {
                                    highlightRow(dataView[i].items[j]);
                                }
                            } else {
                                highlightRow(dataView[i]);
                            }
                        }
                    };

                    var setDataSource = function () {
                        var group = [];
                        if (scope.isGrouped) {
                            group = {
                                field: "sportDisplayName",
                                dir: "asc",
                                aggregates:[{ field: 'sportDisplayName', aggregate: 'count'}]
                            }
                        }
                        scope.assetData = new kendo.data.DataSource({
                            data: scope.assets,
                            schema: {
                                model: {
                                    fields: gridDefinitions.fieldTypes
                                }
                            },
                            group: group
                        });
                    }

                    var init = function () {
                        setDataSource();

                        scope.gridOptions = {
                            columns: columns,
                            height: scope.gridHeight,
                            resizable: true,
                            sortable: isSortable,
                            filterable: isFilterable ? gridDefinitions.filters : false,
                            selectable: 'cell',
                            dataBound: gridDataBound
                        };
                    }

                    var refreshGrid = function () {
                        if (scope.assetGrid) {
                            scope.assetGrid.dataSource.read();
                        }
                    }

                    scope.$on('assets-added', function (event, args) {
                        if (isVisible) refreshGrid();
                    });

                    scope.$on('new-assets', function (event, args) {
                        setDataSource();
                    });

                    // select all and deselect all - looping through each element so we don't have to ren render the entire grid
                    scope.$on('select-all-assets', function (event, args) {
                        if (isVisible) {
                            angular.forEach(scope.assetGrid.dataItems(), function(value, key) {
                                value.selected = true;
                            });
                        }
                    });

                    scope.$on('deselect-all-assets', function (event, args) {
                        if (isVisible) {
                            angular.forEach(scope.assetGrid.dataItems(), function (value, key) {
                                value.selected = false;
                            });
                        }
                    });

                    scope.$on('asset-collections-updated', function(event, assetsUpdated) {
                        angular.forEach(assetsUpdated, function(asset, key) {
                            var update = _.find(scope.assetGrid.dataItems(), function (value) {
                                return value.assetId === asset.assetId;
                            });

                            if (update) {
                                update.collections = asset.collections;
                                update.collectionTitles = asset.collectionTitles;
                            }
                        });
                    });

                    scope.$on('asset-grid-view', function (event, args) {
                        isVisible = true;
                        refreshGrid();
                    });

                    scope.$on('asset-tile-view', function(event, args) {
                        isVisible = false;
                    });

                    scope.$on('assets-expand-all', function (event, isExpandAll) {
                        angular.forEach(scope.assetGrid.dataSource.view(), function (value, key) {
                            if (isExpandAll) {
                                scope.assetGrid.expandGroup('.k-grouping-row:contains(' + value.value + ')');
                            } else {
                                scope.assetGrid.collapseGroup('.k-grouping-row:contains(' + value.value + ')');
                            }
                        });
                    });
                    
                    scope.isHomePage = function() {
                        return $state.current.name === 'home';
                    };

                    // asset methods
                    scope.hasRestrictions = function(asset) {
                        return asset.usageRestrictions && asset.usageRestrictions.length > 0;
                    };

                    scope.hasRevisions = function(asset) {
                        return (asset.version > 1 || asset.revision > 0);
                    };

                    scope.viewAssetDetails = function(asset) {
                        $analytics.eventTrack('Detail Page', { category: 'Navigation', label: asset.assetName.substring(0, 450) });
                        $state.get('asset-detail').data['asset'] = asset;
                        $state.go('asset-detail', {
                            id: asset.assetId
                        });
                    };

                    scope.openZipDialog = function(asset) {
                        ZipService.openDialog(asset);
                    }

                    scope.addAssetToCollection = function(asset) {
                        CollectionService.addAssetsToCollectionDialog(asset);
                    }

                    scope.downloadClicked = function(asset) {
                        DownloadManager.newModal(asset);
                    }

                    scope.streamClicked = function (asset) {
                        var param = {};
                        param.assetId = asset.assetId;
                        param.fileName = asset.assetName;
                        scope.$broadcast('stream-asset', param);
                    }

                    scope.checkboxClicked = function(asset) {
                        asset.selected = !asset.selected;
                    }

                    scope.cellSelected = function (event) {
                        var cell = event.sender.select();
                        cell.removeClass('k-state-selected');
                        var row = cell.parent();
                        var selectedData = scope.assetGrid.dataItem(row);

                        if (cell.index() === 0 || (cell.index() === 1 && scope.isGrouped)) {
                            selectedData.selected = !selectedData.selected;

                            var scopeAsset = filter(scope.assets, { assetId: selectedData.assetId }, true)[0];
                            scopeAsset.selected = !scopeAsset.selected;

                            if (selectedData.selected) {
                                row.removeClass('selected').addClass('selected');
                            } else {
                                row.removeClass('selected');
                            }
                        } else if (cell.index() === 1 || (ClientUserService.isFoxSports && cell.index() === scope.gridOptions.columns.length - 2)) {
                            return;
                        } else if (cell.index() !== scope.gridOptions.columns.length - 1) { // if it's not the asset name or the actions column
                            showDetail(selectedData);
                        }
                    }

                    init();
                }
            };
        }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('UserCollectionsController',
        ['$http', '$q', '$rootScope', '$scope', '$state', '$filter', 'gridOptions', 'CollectionService', 'CollectionFormService',"ClientUserService",
    function ($http, $q, $rootScope, $scope, $state, $filter, gridOptions, CollectionService, CollectionFormService, ClientUserService) {
        // Identify the grids that will exist and configure custom empty messages for each of them.
        // These emptyMessage properties will only exist as the grids are created, then the grid objects are overwritten.

        $scope.reverse = false;
        
        $scope.grids = {
            myCollections: {
                emptyMessage: "You don't own any collections."
            },
            belongToCollections: {
                emptyMessage: "You don't belong to any collections."
            }
        };

        var init = function () {
            _.each(_.keys($scope.grids), function(gridName) {

                $scope.IsFic = ClientUserService.isFic;

                var assetColumns = [
                    { field: "name", title: "Collection Name" },
                    { field: "owner", title: "Owner(s)" },
                    { field: "memberCount", title: "Member Count" },
                    { field: "assetCount", title: "Asset Count" }
                ];

                //for fic trafficer adding additional column for selecting collections 
                if ($scope.clientUser.isFicTrafficer) {
                    assetColumns.unshift({
                        headerTemplate: "<span  ng-if=\"clientUser.isFicTrafficer\">" +
                            " <i class='mb' ng-class=\"{'mb-checkbox-white': !areAllSelected(), 'mb-checkbox-green' : areAllSelected() }\"" +
                            " ng-click='toggleSelectAll()'></i></span> ",
                        width: 30,
                        field: "selected",
                        sortable:false
                    });
                }

               var options = gridOptions('rowTemplate',
                    assetColumns,{
                        selectable:false,
                        filterable: false
                    }
                );

                options.pageable = {
                    messages: {
                        empty: $scope.grids[gridName].emptyMessage
                    }
                };
                
                $scope.grids[gridName] = {
                    loaded: false,
                    options: options
                };
            });

            // for first load
            $rootScope.$emit('cancel-collection-requests', {});

            loadData();
        };


        var ownerCollections, memberCollections;

        // private
        var loadData = function () {
            var result = {
                owner: [],
                member: []
            };

            $scope.loadingCollections = true;

            CollectionService.getUserCollections(false)
                .then(function (response) {
                    function mapToRecord(item) {
                        function mapOwners(list) {
                            return _.compact( _.map(list.members,
                                function (data) {
                                    return (data.role.toLowerCase() !== "member") ? data.displayName : null;
                                }));
                        };

                        return {
                            collectionId: item.collectionId,
                            name: item.title,
                            owner: mapOwners(item).join(", "),
                            memberCount: item.memberCount,
                            assetCount: item.assetCount,
                            isFavorite: item.isFavorite,
                            isOwner: item.isOwner
                        };
                    }

                    var collectionsData = $scope.filteredList = $filter('orderBy')(response.data, 'title', $scope.reverse);
                    

                    _.each(collectionsData, function (responseItem) {
                        if (responseItem.isOwner) {
                            result.owner.push(mapToRecord(responseItem));
                            return;
                        }

                        result.member.push(mapToRecord(responseItem));
                    });

                    ownerCollections = result.owner;

                    $scope.grids.myCollections.options.dataSource.data(ownerCollections);
                    $scope.grids.belongToCollections.options.dataSource.data( result.member);
                   

                    $scope.loadingCollections = false;
                });

            

            return result;
        };

        //Gets selected collections list from two lists
        function getSelectedCollections() {
          return ownerCollections ?
                    _.filter(ownerCollections, function(element) {
                        return element.selected === true;
                    }) : [];
        }

        ///toggles the selected all State 
        $scope.toggleSelectAll = function () {
            var state = $scope.areAllSelected();
            state = !state;
            _.each(ownerCollections, function(item) {
                item.selected = state;
            });
            
            _.each($scope.grids.myCollections.options.dataSource.data(), function(item) {
                item.selected = state;
            });
        }


        //indicates wheter all items are selected or not
        $scope.areAllSelected = function () {
            var retValue = true;
            
            for (var i = 0; i < ownerCollections.length; i++) {
               
                retValue = retValue && ownerCollections[i].selected;

                if (!retValue) {
                    break;
                }

            }

            return true && retValue;
        }

        //row selected handler
        $scope.rowSelect = function (dataItem) {
           var newState  = !dataItem.selected;
            
           var scopeCollection = _.filter(ownerCollections, function(item) {
               return item.collectionId === dataItem.collectionId;
           });

            scopeCollection = scopeCollection && scopeCollection.length > 0 ?
                scopeCollection[0] : null;
            if (scopeCollection) {
                scopeCollection.selected = newState;
                dataItem.selected = newState;
            }

        }

        //indicates wheter notify button is disabled or not.
        $scope.notifyButtonDisabled = function () {
            return getSelectedCollections().length === 0;
        };

        $scope.createCollection = function ( ) {
            CollectionFormService.openDialog();
        };

        //opens collection notification popup.
        $scope.notifyCollectionOwners = function () {
            CollectionFormService.openNotificationDialog(getSelectedCollections());
        };

        init();
    }]);
})();
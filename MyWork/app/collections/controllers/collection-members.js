// TODO: this file requires significant refactor. Too complex. Too many things going on.
(function () {
    'use strict';

    var module = angular.module('fmc.collections');

    module.controller('CollectionMembersController',
        ['$scope', '$rootScope', '$state', '$stateParams', '$location', '$modal',
         'getStateParams', 'gridOptions', 'CollectionService',
    function ($scope, $rootScope, $state, $stateParams, $location, $modal,
              getStateParams, gridOptions, CollectionService) {
        $scope.collectionId = $stateParams.id;
        $scope.loadingMembers = true;
        $scope.maxMembersPerPage =50;
        $scope.membersGrid = {
            loaded: false,
            options: gridOptions("memberRowTemplate", [
                    { field: "firstName", title: "First Name" },
                    { field: "lastName", title: "Last Name" },
                    { field: "email", title: "E-mail Address" },
                    { field: "role", title: "Role" },
                    { field: "addedOn", title: "Added On" }
                ],
                {
                    sortable: true,
                    selectable: false,
                    filterable: false,
                    pageable: true,
                    scrollable: true
                }
            )
        };

        $scope.sendEmail = function (address) {
            var link = "mailto:" + address;

            window.location.href = link;
        };

        var getData = function () {
            $scope.loadingMembers = true;
            CollectionService.getCollection($scope.collectionId).then(loadDataSuccess);
        };

        var loadDataSuccess = function (response) {
            if (!response) {
                return;
            }
          
            $scope.collection = {
                name: response.data.title,
                description: response.data.description,
                createDate: response.data.createDate,
                isFavorite: response.data.isFavorite,
                isOwner: response.data.isOwner,
                assetCount: response.data.assetCount,
                memberCount: response.data.memberCount,
                membersCanDownload: response.data.allowMemberDownload,
                isCollectionAssetsGrouped: response.data.isCollectionAssetsGrouped
            };

            $scope.collection.owners = _
                .filter(response.data.members, function (data) { return data.role.toLowerCase() !== "member"; })
                .map(function (data) { return data.displayName; }).join(", ");

            // bind to collection members grid     
            var gridMembers = _.map(response.data.members, function (data) {
                return {
                    isOwner: (data.role.toLowerCase() === "owner"),
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    title: data.title, 
                    role: data.role,
                    addedOn: data.addedOn
                };
            });

            $scope.membersGrid.options.pageable = (function (memberCount) {
              
                if (memberCount > $scope.maxMembersPerPage) {
                    return {
                        pageSize: $scope.maxMembersPerPage,
                        buttonCount: 5,
                        messages: {
                            previous: "Previous page",
                            next: "Next page"
                        }
                    };
                } else {
                    return false;
                }

            })($scope.collection.memberCount);

            $scope.membersGrid.options.dataSource.data(gridMembers);
            $scope.membersGrid.options.dataSource.sort({ field: "role", dir: "desc" });
            $scope.membersGrid.options.loaded = true;

            $scope.loadingMembers = false;
        };

        getData();
    }]);
})();

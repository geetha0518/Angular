(function () {
    'use strict';

    var module = angular.module('fmc.home');

    module.controller('HomeController', ['$rootScope','$scope', '$http', '$state', '$window', '$analytics', '$timeout', 'FieldService', 'AssetSearchService', 'CollectionService', 'ClientUserService', 'SessionService',
        function ($rootScope, $scope, $http, $state, $window, $analytics,$timeout, FieldServices, AssetSearchService, CollectionService, ClientUserService, SessionService) {
            $scope.newReleases = [];

            $scope.backgroundImageClass = function () {
                if (ClientUserService.isFic) {
                    return 'fic';
                } else {
                    return 'default';
                }
            }

            var homeViewKey = 'home-view-new-uploads';
            if (ClientUserService.isFic) {
                $scope.view = SessionService.get(homeViewKey, 'table');
            } else {
                $scope.view = SessionService.get(homeViewKey, 'grid');
            }

            $scope.toggleView = function (view) {
                var labelValue = '';

                if (view === 'grid') {
                    labelValue = 'gallery';
                } else if (view === 'table') {
                    labelValue = 'list';
                    $timeout(function () { $rootScope.$broadcast('asset-grid-view'); }, 0);
                }

                $analytics.eventTrack('View', { category: 'Navigation', label: labelValue });
                $scope.view = view;
                SessionService.set(homeViewKey, $scope.view);
            }


            // Returns a list containing the number of assets that will fit entirely on a single row.
            var singleRowAssets = function () {
                if ($scope.assets && $scope.assets.length > 0) {
                    var assetWidth = 180; // have to hard code width because elements might not exist to inspect
                    var containerWidth = $("#wrapper").width();
                    var numberOfAssets = Math.floor(containerWidth / assetWidth);

                    $scope.singleRowAssets = _.take($scope.assets, numberOfAssets);
                }
            };

            angular.element($window).bind("resize", singleRowAssets);
            $scope.$watch('assets', singleRowAssets);

            $scope.init = function () {
                var searchTerms = null;
                var dateFilters = null;
                var offset = 0;
                var limit = 15;
                var sortTerms = [{
                    field: "ARTESIA.FIELD.DATE_IMPORTED",
                    order: "desc"
                }];

                $scope.loadingNewUploads = true;

                var getNewUploads = AssetSearchService.search(searchTerms, dateFilters, offset, limit, sortTerms);
                getNewUploads.then(function (response) {
                    $scope.assets = response.data.results;
                    $scope.totalResults = response.data.totalResults;

                    $scope.loadingNewUploads = false;
                    $timeout(function() { $rootScope.$broadcast('assets-added'); }, 0);
                });
            };

            $scope.init();

            /// =======================================================================
            /// Action Bar Events and specific binders
            /// TODO: move to better location or encapsulate into asset-stage directive structure
            //
            $scope.showDetail = function (title) {
                var searchTerms = [
                    {
                        field: 'FOX.FIELD.TITLE',
                        term: title.title
                    }
                ];

                $state.go('assets', {
                    filters: angular.toJson(searchTerms),
                    offset: 0
                });
            };

            ///
            /// End TODO: move to better location or encapsulate into asset-stage directive structure
            /// =======================================================================

            $scope.submitSearch = function (searchTerms) {
                $state.go('assets', {
                    filters: angular.toJson(searchTerms),
                    offset: 0
                });
            };

            $scope.$on('search-submitted', function (ev, searchTerms) {
                $scope.submitSearch(searchTerms);
            });

            $scope.titleSearch = function (params) {
                $state.go('titles', {
                    searchParams: angular.toJson(params)
                });
            };

            $scope.catalogSearch = function (params) {
                $state.go('catalog', {
                    searchParams: angular.toJson(params)
                });
            };

            $scope.goToCollections = function () {
                $state.go('collections');
            };

            $scope.goToCollection = function (collectionId) {
                $state.go('collection-assets', {
                    id: collectionId
                });
            };
        }]);
})();
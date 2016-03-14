(function () {
    'use strict';

    var module = angular.module('fmc.collections', [
        'ui.router'
    ]);


    module.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('collections', {
            url: '/collections',
            views: {
                "main": {
                    controller: 'UserCollectionsController',
                    templateUrl: '/Scripts/app/collections/views/user-collections.tpl.html'
                }
            },
            data: {
                pageTitle: 'My Collections'
            },
            authorization: {
                allowAll: true
            }
        });

        $urlRouterProvider.when('/collection/:id/assets', '/collection/:id/assets/');

        $stateProvider.state('collection-assets', {
            url: '/collection/:id/assets/?filters&offset&sort&limit&view&dateFilters',
            reloadOnSearch: false,
            views: {
                "main": {
                    controller: 'CollectionAssetsController',
                    templateUrl: '/Scripts/app/collections/views/collection-assets.tpl.html'
                }
            },
            data: {
                // This prefix is used as a read-only property to generate the pageTitle.
                // grep for pageTitlePrefix to see it in action.
                pageTitlePrefix: 'Collection Assets',
                // pageTitle is the actual page title for each collection-assets page. This
                // property is overwritten by the controller to include the collection name.
                // Something like 'Collection Assets - For Approval'
                pageTitle: 'Collection Assets'
            },
            authorization: {
                allowAll: true
            }
        });

        $urlRouterProvider.when('/collection/:id/members', '/collection/:id/members/');

        $stateProvider.state('collection-members', {
            url: '/collection/:id/members/',
            reloadOnSearch: false,
            views: {
                "main": {
                    controller: 'CollectionMembersController',
                    templateUrl: '/Scripts/app/collections/views/collection-members.tpl.html'
                }
            },
            data: {
                pageTitle: 'Collection Assets'
            },
            authorization: {
                allowAll: true
            }
        });
    }]);
})();
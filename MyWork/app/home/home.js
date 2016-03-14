(function () {
    'use strict';

    var module = angular.module('fmc.home', [
        'fmc.common',
        'ui.router'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', 'UserRoleConstants', function ($stateProvider, $urlRouterProvider, UserRoleConstants) {
        $stateProvider.state('home', {
            url: '/home',
            views: {
                "main": {
                    controller: 'HomeController',
                    templateUrl: '/Scripts/app/home/views/home.tpl.html'
                }
            },
            resolve: {
                $state: '$state',
                ClientUserService: 'ClientUserService',
                ficCustomerHandler: function ($state, ClientUserService) {
                    var user = ClientUserService.getCurrentUser();

                    if (user.role === UserRoleConstants.FIC_CUSTOMER) {

                        if (user.primaryCollection > 0) {
                            $state.go('collection-assets', {
                                id: user.primaryCollection
                            });

                            return;
                        }

                        $state.go('collections');
                    }
                }
            },
            data: {
                pageTitle: 'Home'
            },
            authorization: {
                denyRoles: [{
                    role: UserRoleConstants.FOX_SPORTS_APPROVER,
                    route: 'collection-assets',
                    data: {
                        id: 1
                    }
                }, {
                    role: UserRoleConstants.FOX_SPORTS_AFFILIATE,
                    route: 'collection-assets',
                    data: {
                        id: 2
                    }
                }, {
                    role: UserRoleConstants.FOX_SPORTS_MEDIA_SERVICES, 
                    route: 'autodownloader-transfers',
                    data: { }
                }
                ]
            }
        });

        // Enabling this will cause issues for people trying to log in.
        // You have been warned.
        //$urlRouterProvider.when('/', '/home');
    }]);
})();

/* global _: true */


(function () {
    'use strict';

    var module = angular.module('fmc', [
        'fmc.common',
        'fmc.home',
        'fmc.assets',
        'fmc.collections',
        'fmc.transfers',
        'fmc.components',
        'fmc.help',
        'fmc.history',
        'ui.router',
        'ui.bootstrap',
        'angular-data.DSCacheFactory',
        'angulartics',
        'angulartics.google.analytics',
        'kendo.directives',
        'fmc.videostream',
        'kendo.directives',
        'fmc.imagezoom',
        'fmc.revision',
        'fmc.delete',
        'fmc.download',
        'fmc.search',
        'ipCookie',
        'ng.deviceDetector',
        'fmc.config'
    ]);

    module.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
        'datepickerConfig', 'DSCacheFactoryProvider', '$analyticsProvider', '$tooltipProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider,
        datepickerConfig, DSCacheFactoryProvider, $analyticsProvider, $tooltipProvider) {

        $locationProvider.html5Mode(true);
        $analyticsProvider.virtualPageviews(true);

        $tooltipProvider.options({
            placement: 'bottom',
            popupDelay: 1000
        });

        $httpProvider.interceptors.push('httpInterceptor');

        datepickerConfig.showWeeks = false;

        DSCacheFactoryProvider.setCacheDefaults({
            maxAge: 300000, /* 5 minute max age for any item see ESX-1756 */
            cacheFlushInterval: 900000, /* full flush every 15 minutes */
            deleteOnExpire: 'aggressive', /* immediate removal once expired */
            storageMode: 'memory', /* persist in memory EFMCC-86 */
            capacity :12 /* setting limit to 8 items to avoid memory issues , convert cache in LRU assuming 8 large 2mb size items*/
        });

        // Application Path is root Path, however, users never experience this path
        $stateProvider.state('rootpath', {
            url: '/',
            data: {
                pageTitle: 'Fox Media Cloud'
            },
            authorization: {
                denyAll: true,
                failOver: 'home'
            }
        });

        // Do not point this to any route that is not FULLY allowed to ANY user.
        // You have been warned.
        $urlRouterProvider.otherwise('/help');
    }]);

    module.run(['$rootScope', '$location', 'DSCacheFactory', 'AuthorizationService', 'ipCookie', 'SimpleHistoryService',
        function ($rootScope, $location, DSCacheFactory, AuthorizationService, ipCookie, SimpleHistoryService) {

        // setup caches
        DSCacheFactory('defaultCache', {});
        DSCacheFactory('urlCache', {
            maxAge: null,
            cacheFlushInterval: null,
            storageMode: 'memory'
        });

        $rootScope.$on('$stateChangeStart', AuthorizationService.stateChangeStartHandler);
        $rootScope.$on('$stateChangeStart', SimpleHistoryService.stateChangeStartHandler);
        SimpleHistoryService.clearHistory();

        /* eslint-disable one-var */
        // Redirect the user if the cookie contains a redirect URL.
        var redirectPath = ipCookie('DeepLinkSupport');
        if (redirectPath) {
            var path = redirectPath.split('?')[0],
                search = redirectPath.split('?')[1];

            $location.path(path);

            if (search) {
                $location.search(search);
            }

            ipCookie.remove('DeepLinkSupport');
        }
    }]);

    module.controller('AppController', ['$rootScope', '$scope', '$state', '$http', '$window', 'messageService',
                      'FieldService', 'DSCacheFactory', 'ClientUserService', 'SessionService', 'paneManager', 'BrowserCheckService',
        function ($rootScope, $scope, $state, $http, $window, messageService, FieldService, DSCacheFactory,
                  ClientUserService, SessionService, paneManager, BrowserCheckService) {

            var shiftMainContent = function (isShiftDown) {
                var centerPane = document.getElementsByClassName('center-pane'); //margin-top 104
                var sidebarLeft = document.getElementsByClassName('sidebar-left'); // padding top 110
                var pulltabLeft = document.getElementsByClassName('pulltab-left');

                if (pulltabLeft.length === 1) {
                    pulltabLeft[0].style.top = isShiftDown ? '97px' : '70px';
                }

                if (sidebarLeft.length === 1) {
                    sidebarLeft[0].style.paddingTop = isShiftDown ? '103px' : '76px';
                }

                if (centerPane.length === 1) {
                    centerPane[0].style.marginTop = isShiftDown ? '27px' : '0';
                }
            };

            $scope.panes = paneManager;
            $scope.pageTitle = 'Fox Media Cloud';
            $scope.navcollapsed = false;
                       
            //RR EFMCC-41 don't show search panel initially; this will be made visible on $stateChangeSuccess (below) as required
            $scope.panes.visible = false;

            //RR EFMCC-49 check for old browsers
            $scope.bcs = BrowserCheckService;

            $scope.unsupported = $scope.bcs.checkBrowser();
            $scope.upgradeMessage = $scope.bcs.upgradeMessage;

            var showAsperaWarning = BrowserCheckService.checkChromeAsperaSupport();
            if (showAsperaWarning) {
                $scope.unsupported = true;
                $scope.upgradeMessage = "You have Google Chrome v" + BrowserCheckService.chromeVersion + ". Chrome is currently blocking support for our Download plugin. A resolution is in progress. To continue downloading content, please use Firefox on Windows and Safari on Mac. If you have any questions, please contact FMC Support";

                shiftMainContent(true);
            }

            var preload = function() {
                if (FieldService.isReady()) {
                    return null;
                }
                return FieldService.loadingPromise();
            };

            /* eslint-disable no-unused-vars */
            $scope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
                if (toState.name === 'home' && (fromState.name !== 'collection-assets')) {
                    $rootScope.$broadcast('clear-search-filters-pane');
                }

                // yield to preloading process
                toState.resolve = angular.extend(toState.resolve || {}, {
                    __preload__: preload
                });
            });

            $scope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
                var statesWithPanes = ['assets', 'collection-assets'];
                $scope.panes.visible = true;
                $scope.panes.panesEnabled = _.contains(statesWithPanes, toState.name);

                // Always close the right pane. Users will always have to select an asset when they're on a page.
                $scope.panes.rightOpen = false;

                if (fromState.name === 'assets' && toState.name !== 'assets') {
                    $rootScope.$broadcast('clear-search-filters-pane');
                }

                if (angular.isDefined(toState.data.pageTitle)) {
                    $scope.pageTitle = 'Fox Media Cloud - ' + toState.data.pageTitle;
                }

                $scope.clientUser = ClientUserService.getCurrentUser();
                $rootScope.clientUser = ClientUserService.getCurrentUser();
            });

            messageService.on('fmc.assets.keyword-search', $scope, function(e, keywords) {
                //$state.go('assets', { keywords: keywords, offset: 50 });
            });

            var clearCache = function() {
                var defaultCache = DSCacheFactory.get('defaultCache');
                defaultCache.removeAll();
            };

            $scope.clearSessionAndCache = function() {
                clearCache();
                SessionService.clear();
                ga('set', 'dimension1', "");
                $window.open('/Account/Logout', '_self');
            };

            $scope.hideBrowserMessage = function() {
                var msgRibbon = document.getElementById("browserUpgradeMessage");
                msgRibbon.style.display = 'none';
                shiftMainContent(false);
            };

            if (window.ga) {
                var role = ClientUserService.getRoleLabelByValue();
                ga('set', 'dimension1', role);
            }
        }]);
})();

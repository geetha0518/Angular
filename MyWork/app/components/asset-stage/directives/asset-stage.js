(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('assetStage', ['ClientUserService', function (ClientUserService) {
        return {
            restrict: 'E',
            scope: {
                assets: '='
            },
            replace: true,
            transclude: true,
            template: '<div ng-transclude></div>',
            controller: function ($rootScope, $scope, $state, $timeout, SessionService, getStateParams) {
                var panels = [];
                var tabs = [];

                var defaultState = 'asset-tile-view';

                if (ClientUserService.isFic) {
                    defaultState = 'asset-grid-view';
                }

                var sessionKey = $state.current.name + '-view/' + getStateParams().id;
                var state = SessionService.get(sessionKey, defaultState);

                this.addPanel = function (viewPanel) {
                    if (state !== "") {
                        viewPanel.selected = viewPanel.linkto === state;
                    } else if (panels.length === 0) {
                        viewPanel.selected = true;
                    }

                    panels.push(viewPanel);

                    if (viewPanel.selected) {
                        $rootScope.$broadcast(state); // broadcast the view
                    }
                };

                this.removePanel = function (viewPanel) {
                    if (panels.length === 0) {
                        return;
                    }

                    panels = _.without(panels, viewPanel);
                };

                this.addTab = function (viewTab) {
                    if (state !== "") {
                        viewTab.selected = viewTab.linkto === state;
                    } else if (tabs.length === 0) {
                        viewTab.selected = true;
                        state = viewTab.linkto;
                    }
                    tabs.push(viewTab);
                };

                this.removeTab = function (viewTab) {
                    if (tabs.length === 0) {
                        return;
                    }

                    tabs = _.without(tabs, viewTab);
                };

                this.selectTab = function (viewTab) {
                    state = viewTab.linkto;
                    SessionService.set(sessionKey, state);

                    angular.forEach(tabs, function (tab) {
                        tab.selected = angular.equals(tab, viewTab);
                    });

                    angular.forEach(panels, function (panel) {
                        panel.selected = angular.equals(panel.linkto, state);

                        if (panel.selected) {
                            $timeout(function() { $rootScope.$broadcast(state); }, 0); // broadcast the view
                        }
                    });
                };
            }
        };
    }]);
})();

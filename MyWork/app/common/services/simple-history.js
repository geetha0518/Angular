(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('SimpleHistoryService', ['SessionService', function (SessionService) {
        var localStorageKey = "simplehistory";

        var historyPoint = SessionService.get(localStorageKey, null);

        var setHistoryPoint = function (value) {
            historyPoint = value;
            SessionService.set(localStorageKey, value);
        };

        var addHistoryPoint = function (fromState, fromParams) {
            setHistoryPoint({
                label: fromState.data.pageTitle,
                routeName: fromState.name,
                data: fromParams
            });
        };

        this.stateChangeStartHandler = function (e, toState, toParams, fromState, fromParams) {
            if (!fromState.abstract) {
                addHistoryPoint(fromState, fromParams);
            }
        };

        this.backHistory = function () {
            return historyPoint;
        };

        this.clearHistory = function () {
            setHistoryPoint(null);
        };
    }]);
})();
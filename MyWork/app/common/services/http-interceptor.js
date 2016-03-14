(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.factory('httpInterceptor', ['$q', '$log', '$timeout', 'AlertsService', function ($q, $log, $timeout, alertsService) {
        var interceptor = {};
        var dataDelay = 0;

        interceptor.isDataRequest = function(request) {
            return request && request.url && request.url.indexOf('.json') > 0;
        };

        interceptor.request = function(request) {            
            var deferred = $q.defer();
            var delay = interceptor.isDataRequest(request) ? dataDelay : 0;

            $timeout(function() {
                deferred.resolve(request);
            }, delay);

            return deferred.promise;
        };

        interceptor.response = function(response) {
            return response || $q.when(response);
        };

        interceptor.responseError = function(rejection) {
            // TODO: can recover or get more information?      
            $log.error('http error: ' + rejection.status + ' : ' + rejection.config.url);
            //alertsService.flashError('Oops, an error occurred while processing your request.');
            return $q.reject(rejection);
        };

        return interceptor;
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.transfers');

    module.service('TransferRecordService', [
        '$rootScope', '$http', '$q', '$modal', '$analytics', '$log',
        function ($rootScope, $http, $q, $modal, $analytics, $log) {
            var requests = [];


            this.getRecords = function (extParams) {

                var defaultParams = {
                    offset: 0,
                    limit: 50,
                    sortTerms: {
                        field: "StatusDateTime",
                        order: "desc"
                    }
                };

                var searchCriteria = _.extend(defaultParams, extParams);

                var cancellor = $q.defer();
                requests.push(cancellor);

                return $http.get('/api/Transfers', { params: searchCriteria, timeout: cancellor.promise });
                
            };


            this.cancelPendingRequests = function () {
                _.each(requests, function (request) {
                    request.resolve("Canceled Request");
                });
                requests = [];
            };
           
            this.loadTransferConfiguration = function(){
                return $http.get('/api/TransferConfig');
            };

        }]);
})();

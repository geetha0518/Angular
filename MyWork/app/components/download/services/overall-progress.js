(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.service('OverallProgress', ['$http', '$q',
        function ($http, $q) {

            var transferProgress = {
                _overallProgress: 0,
                _overallTimeRemaining: 0,
                _overallBytes_expected: 0,
                _overallBytes_written: 0
            };

            this.calculate = function (assets) {
                var overallBytes_expected = 0;
                var overallBytes_written = 0;
                var overallCalculated_rate_kbps = 0;
                var allTimeRemaining = 0;

                _.each(assets, function (item) {
                    overallBytes_expected += item.transfer.bytes_expected;
                    overallBytes_written += item.transfer.bytes_written;
                    overallCalculated_rate_kbps += item.transfer.calculated_rate_kbps;
                    allTimeRemaining += item.transfer.timeRemaining;
                });

                transferProgress._overallProgress = (overallBytes_written / overallBytes_expected) * 100;
                transferProgress._overallTimeRemaining = allTimeRemaining;
                transferProgress._overallBytes_expected = overallBytes_expected;
                transferProgress._overallBytes_written = overallBytes_written;

                return transferProgress;
            };

            this.reset = function() {
                transferProgress._overallProgress = 0;
                transferProgress._overallTimeRemaining = 0;
                transferProgress._overallBytes_expected = 0;
                transferProgress._overallBytes_written = 0;
                return transferProgress;
            }
        }]);
})();
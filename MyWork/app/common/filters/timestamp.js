(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('timestamp', [function ($window) {
        return function(seconds) {            
            if (seconds === Infinity || isNaN(seconds)) {
                return "--:--";
            }

            var minutes = Math.floor(seconds / 60);
            seconds = seconds - (minutes * 60);

            if (seconds < 10) { seconds = "0" + seconds; }
            var timestamp = minutes + ':' + seconds;
            return timestamp;
        };
    }]);
})();
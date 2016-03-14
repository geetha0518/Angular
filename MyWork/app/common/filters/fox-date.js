(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('foxDate', [function () {
       
        return function (date) {

            // Adding code to split the date for a format that is accepted by all browsers...
            var a = date.split(/[^0-9]/);
            var theDate = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);

            var utc = theDate.getTime() + (theDate.getTimezoneOffset() * 60000);
            var originalOffset = date.substring(date.lastIndexOf('-'), date.length);
            var timezone = originalOffset.substring(0, 3);
            var nd = new Date(utc + (3600000 * timezone));
            var result = '';

            if (nd instanceof Date && !isNaN(nd.valueOf())) {

                // using dateformat library
                result = nd.format('mm/d/yyyy');
            } else {

                // using dateformat library
                result = theDate.format('mm/d/yyyy');
            }

            return result;

        }
    }]);
})();

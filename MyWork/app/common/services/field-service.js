(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('FieldService', ['$http', '$log', function ($http, $log) {
        var lookup = null;

        var requestPromise = $http.get('/api/Metadata').success(function (response) {
            lookup = response;
        });

        this.isReady = function() {
            return lookup != null;
        }

        this.loadingPromise = function() {
            return requestPromise;
        }

        this.displayName = function(field) {
            if (!field) {
                return "";
            }

            if (!lookup) {
                $log.error('field lookup table not yet loaded');
                return field;
            }

            if (field === "SYSTEMX.KEYWORD") {
                return "KEYWORD";
            }

            var metadata = _.find(lookup, function (item) {
                return item.fieldId === field;
            });

            if (!metadata) {
                return field;
            }

            return metadata.displayName;
        };
    }]);
})();
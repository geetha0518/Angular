(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.factory('getStateParams', ['$urlMatcherFactory', '$location', '$state',
    function($urlMatcherFactory, $location, $state) {

        return function() {            
            var urlMatcher = $urlMatcherFactory.compile($state.current.url);
            return urlMatcher.exec($location.path(), $location.search());
        };

    }]);
})();
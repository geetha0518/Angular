(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('messageService', ['$rootScope', function ($rootScope) {
        this.emit = function(name, args) {
            $rootScope.$emit(name, args);
        };

        this.on = function(name, scope, fn) {
            var unbind = $rootScope.$on(name, fn);
            scope.$on('$destroy', unbind);
        };
    }]);
})();
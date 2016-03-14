(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.directive('thumbnailPlaceholder', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/Scripts/app/assets/views/thumbnail-placeholder.tpl.html',
            scope: {
                imageUrl: '='
            },
            link: function(scope, attrs, el) {
                scope.thumbnail = function() {  
                    if (scope.imageUrl && scope.imageUrl.length > 1) {
                        return scope.imageUrl;
                    } else {
                        return "/Content/Images/no-image.png";
                    }
                };
            }
        };
    });
})();
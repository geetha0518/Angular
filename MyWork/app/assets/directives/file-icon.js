(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.directive('fileIcon', function () {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/assets/views/file-icon.tpl.html',
            scope: {
                asset: '='
            },
            link: function(scope, attrs, el) {
                scope.icon = function () {
                    if (!scope.asset) {
                        return 'FILE';
                    }

                    // We have icons for pictures, movies and audio. Everything else is just a "file."
                    var fileTypeCategoriesWithIcons = ["PICTURE", "MOVIE", "AUDIO"];
                    if (_.contains(fileTypeCategoriesWithIcons, scope.asset.fileTypeCategory)) {
                        return scope.asset.fileTypeCategory;
                    } else {
                        return 'FILE';
                    }
                };
            }
        };
    });
})();

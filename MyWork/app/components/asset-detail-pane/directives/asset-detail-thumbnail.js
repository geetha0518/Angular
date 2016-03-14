(function() {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('assetDetailThumbnail', [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                thumbImageUrl: '=',
                zoomImageUrl: '=',
                hasRestrictions: '=?',
                allowZoom: '=?',
                zoomStyle: '=?',
                isThumbnailLoading: '=?',
                isZoomLoading: '=?'
            },
            templateUrl: '/Scripts/app/components/asset-detail-pane/views/asset-detail-thumbnail.tpl.html',
            link: function(scope, element, attrs) {
                // if the need for more "styles" increases, this should
                // be turned into a real system. It's only used in two places
                // right now, so this is sufficient.
                if (scope.zoomStyle == 'right') {
                    scope.zoomOffsetX = 380;
                } else {
                    scope.zoomOffsetX = -456;
                }           
            }
        }
    }]);
})();

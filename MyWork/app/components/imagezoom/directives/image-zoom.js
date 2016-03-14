(function () {
    'use strict';

    var module = angular.module('fmc.imagezoom', []);

    module.constant('ImageZoomDefaults', {
        zoomFactor: 3,
        enable: true,
        width: 400,
        height: 400,
        offsetX: 0,
        offsetY: 0,
        backgroundColor: 'black'
    });

    module.directive('imageZoom', ['ImageZoomDefaults', '$document', '$window',
        function (ImageZoomDefaults, $document, $window) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/Scripts/app/components/imagezoom/views/image-zoom.tpl.html',
                scope: {
                    imageUrl: '=?', 
                    zoomFactor: '=?',
                    enable: '=?',
                    width: '=?',
                    height: '=?',
                    offsetX: '=?',
                    offsetY: '=?',
                    backgroundColor: '=?',
                    isLoading: '=?'
                },
                link: function($scope, element, attrs) {
                    var parent,
                        visible;

                    $scope.zoomFactor = $scope.zoomFactor || ImageZoomDefaults.zoomFactor;
                    $scope.width = $scope.width || ImageZoomDefaults.width;
                    $scope.height = $scope.height || ImageZoomDefaults.height;
                    $scope.offsetX = $scope.offsetX || ImageZoomDefaults.offsetX;
                    $scope.offsetY = $scope.offsetY || ImageZoomDefaults.offsetY;
                    $scope.backgroundColor = $scope.backgroundColor || ImageZoomDefaults.backgroundColor;

                    $scope.display = 'none';
                    $scope.left = 0;
                    $scope.top = 0;
                    $scope.lenseLeft = 0;
                    $scope.lenseTop = 0;
                    $scope.lenseWidth = $scope.width * $scope.zoomFactor;
                    $scope.lenseHeight = $scope.height * $scope.zoomFactor;

                    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                        return;
                    }

                    var init = function() {
                        parent = element.parent();
                        visible = false;
                        
                        position();
                        parent.on('mouseenter', show);
                    };

                    var hide = function() {
                        if (!visible) return;

                        visible = false;
                        $scope.display = 'none';
                        element.hide();
                        removeEvents();
                    };

                    var show = function() {
                        if (visible) return;
                        if (!$scope.enable) return;

                        visible = true;
                        $scope.display = 'block';
                        element.show();
                        position();
                        addEvents();
                    };

                    var position = function() {
                        var relativePos = parent.offset();
                        $scope.left = $scope.offsetX + relativePos.left;
                        $scope.top = $scope.offsetY + relativePos.top;
                        $scope.top -= $window.scrollY || pageYOffset;
                    };

                    var addEvents = function() {
                        parent.on('mouseleave', hide);                        
                        parent.on('mousemove', mouseMove);
                    };

                    var removeEvents = function() {
                        parent.off('mouseleave', hide);
                        parent.off('mousemove', mouseMove);
                    };

                    var mouseMove = _.throttle(function(e) {
                        var target = e.target || e.srcElement,
                            rect = target.getBoundingClientRect(),
                            offsetX = e.clientX - rect.left,
                            offsetY = e.clientY - rect.top;

                        var rx = offsetX / rect.width;
                        var ry = offsetY / rect.height;
                        var w = $scope.width;
                        var h = $scope.height;
                        var lw = $scope.lenseWidth;
                        var lh = $scope.lenseHeight;

                        $scope.lenseLeft = (rx * lw * -1) + w/2;
                        $scope.lenseTop = (ry * lh * -1) + h/2;

                        $scope.$apply();
                    }, 100);

                    init();
                }
            };
        }
      ]);
})();
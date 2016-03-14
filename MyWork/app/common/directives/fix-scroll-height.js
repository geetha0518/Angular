/*
 * Directive to
 * determines fixes scroll height for element based on window and parent heights
 */

(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.directive('fixScrollHeight', ['$timeout', function($timeout) {
        return {
            restrict: 'EA',
            transclude: true,
            template: '<div ng-transclude></div>',
            //replace: true,
            link: fixScrollHeight
        };

        function fixScrollHeight($scope, $elem, $attrs) {
            /* elements */
            var $window = angular.element(window),
                elem = $elem[0], // the current element

                /* detect window height changes to scrollable height change */
                windowHeight = $window.outerHeight(),

            /* initial css which needs to be restored if needed */
                initialCSS = {
                    height: $elem.css('height'),
                    overFlowY: $elem.css('overflow-y')
                },

                initialParentHeight;

            /* service functions: */
            function calcSiblingHeights() {
                var siblings = $elem.parent().children(),
                    value = 0;

                angular.forEach(siblings, function (sibling) {
                    if (sibling !== elem) {
                        value += sibling.offsetHeight;
                    }
                });

                return value;
            }

            function calcChildHeights() {
                var children = $elem.children(),
                    value = 0;

                angular.forEach(children, function (child) {
                    value += child.offsetHeight;
                });

                return value;
            }

            function parentHeight() {
                return $elem.parent().outerHeight();
            }

            function calcMaxHeight() {
                return -80 + (windowHeight - calcSiblingHeights());
            }

            function onResize() {
                fixMaxHeight();
            }

            function onDestroy() {
                $window.off('resize', onResize);
            }

            function fixMaxHeight() {
                var maxHeight = calcMaxHeight(),
                    children = $elem.children();

                children[0].style.maxHeight = maxHeight + 'px';
                children.css('overflow-y', 'auto');

                if (initialParentHeight > parentHeight()) {
                    children[0].style.maxHeight = calcMaxHeight() + 'px';
                }

                initialParentHeight = parentHeight();
            }

            initialParentHeight = parentHeight();
            fixMaxHeight();

            // delay watching parent height changes to allow sidepanels to load:
            delayWatchPH();

            /* Listeners */
            $window.on('resize',  $scope.$apply.bind($scope, onResize));
            $scope.$on('$destroy', onDestroy);

            /* if either parent or window height change, call fixMaxHeight() */
            $scope.$watch(function() {
                return $window.outerHeight();
            }, function(newVal) {
                    windowHeight = newVal;
                    fixMaxHeight();
            });

            function delayWatchPH() {
                $timeout(function () {
                    watchPH();
                }, 200);
            }

            function watchPH() {
                return $scope.$watch(parentHeight,
                    function () {
                        fixMaxHeight();
                    });
            }

        }

    }]);
}());

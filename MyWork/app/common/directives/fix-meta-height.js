/*
 * Directive to apply style changes to fixed element in DOM
 * applies overflow-y="auto"  and max-height appropriately to element if element is larger than parent, 
 * may also be be used in conjunction with parent to set direction="ltr" via styling of fixScrollHeight element
 * optionally take parameter to target super-parent element # (above direct parent) to detect height changes
 * e.g. sp="2" would take the grand parent of the current element to detect height changes
 */

(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.directive('fixMetaHeight', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div ng-transclude></div>',
            link: {
                pre: hideScroll,
                post: fixScrollHeight
            }
        };

        function hideScroll($scope, $elem, $attrs) {
        	var	sp = typeof $attrs.sp === 'string' ? parseInt(($attrs.sp)) : 0;

            if (sp === 0 || isNaN(sp)) {
                $scope.targetElem = $elem.parent();
            } else {
                $scope.targetElem = $elem;
                do {
                    $scope.targetElem = $scope.targetElem.parent();
                    sp--;
                } while (sp > 0) 

            }

            $scope.targetElemDisp = $scope.targetElem.css('display');
            $scope.targetElem.css('display', 'none');
            return;
        };

        function fixScrollHeight($scope, $elem, $attrs) {
            /* elements */
            var $window = angular.element(window),
                elem = $elem[0], // the current element
                targetElem = $scope.targetElem, // the target element for determining children and scrolling

                /* detect window height changes to scrollable height change */
                windowHeight = $window.outerHeight(),

            /* initial css which needs to be restored if needed */
                initialCSS = {
                    height: $elem.css('height'),
                    overFlowY: $elem.css('overflow-y')
                },

                initialParentHeight,

                fixMaxHeight = _.debounce(function () {
                    var maxHeight = calcMaxHeight(),
                        children = $elem.children();
    
                    /*   children[0].style.maxHeight = maxHeight + 'px';
                    children.css('overflow-y', 'auto'); 

                    if (initialParentHeight > targetElemHeight()) {
                        children[0].style.maxHeight = calcMaxHeight() + 'px';
                    }*/ 
                    children.css('overflow-y', 'auto'); 
                    children[0].style.maxHeight = calcMaxHeight() + 'px';

    
                    initialParentHeight = targetElemHeight();
                }, 250);

            /* service functions: */
            function calcChainHeights() {
                var value = 0;

                angular.forEach($scope.siblingHeights, function (sibling) {
                    value += sibling;
                });

                return value;
            }

            function targetElemHeight() {
                return targetElem.outerHeight();
            }

            function calcMaxHeight() {
                    /* take the target elemement's on the transcluded div */
                var parHeight = targetElem.outerHeight(),
                    cHeight = calcChainHeights();

                return parHeight - cHeight;
            }

            function onResize() {
                fixMaxHeight();
            }

            function onDestroy() {
                $window.off('resize', onResize);
            }


            initialParentHeight = targetElemHeight();
            trackSiblings();

            // delay watching parent height changes to allow sidepanels to load:
            $timeout(function () {
                watchSibHeights();
                watchElemH();
            }, 300);


            // unhide parent elements
            targetElem.css('display', $scope.targetElemDisp);

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

            function trackSiblings() { 
                
                $scope.siblingHeights = [];
                
                angular.forEach(targetElem.children(), function(sibling) {
                   if (sibling !== elem) {
                       if (typeof sibling.offsetHeight !== 'undefined' && typeof sibling.offsetHeight !== 'string' ) {
                            $scope.siblingHeights.push(sibling.offsetHeight);
                       } else {
                            $scope.siblingHeights.push(0);
                       }
                   }
                }) 
            }

            function watchSibHeights() {
                $scope.$watch(function () {
                    var i = 0,
                        changed = false;

                    angular.forEach(targetElem.children(), function (sibling) {
                        if (sibling.offsetHeight !== $scope.siblingHeights[i] && sibling !== elem) {
                            $scope.siblingHeights[i] = sibling.offsetHeight;
                            changed = true;
                        }
                        i++;
                    });
                    if (changed) {
                        fixMaxHeight();
                    }
                });
            }

            function watchElemH() {
                $scope.$watch(targetElemHeight,
                    function () {
                        fixMaxHeight();
                    });
            }

        }

    }]);
}());

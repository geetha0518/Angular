/*
 * Directive to position element on page by examining elements above or below it and adjusting position accordingly 
 * usage: <element otherAttributes anchor [location="top" | "bottom"{default}] [offset=<# pixels; {default: 0}>] 
 *         [anchortogglestatic="class | id  <attribute>"]>...</element>
 * for anchortogglestatic="..." locates a unique css class, or id to watch to set the off anchored value to static
 *     where attribute is compared numerically (if old value is < new value, then static is set)
 */
 
(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.directive('anchor', ['paneManager', '$timeout', function(paneManager, $timeout) {
        return {
            restrict: 'A',
            link: anchor
        };

        function anchor($scope, $elem, $attrs) {
            var location, togglestatic, initialCSS, initialStyle, windowHeight, offset, anchor,
                parentHeight, tagCSS, 

            /* elements */
            $window = angular.element(window),
            $body = angular.element(document.body),
            elem = $elem[0], // the "anchor" element

            /* detect window height changes to trigger position */
            windowHeight = $window.height();
            parentHeight = $elem.parent().css('height'); 

            /* attributes */
            location     = $attrs.location || 'bottom';
            tagCSS = togglestatic = $attrs.anchortogglestatic || null;

            initialStyle = $elem.attr('style'); // to be added later if necessary

            offset = typeof $attrs.offset === 'string' ? parseInt($attrs.offset.replace(/px;?/, '')) : 0;

            /* initial css which needs to be restored after anchor completes */
            initialCSS = {
                top:       $elem.css('top'),
                bottom:    $elem.css('bottom'),
                position:  $elem.css('position'), 
                marginTop: $elem.css('margin-top')
            }

            /* service functions: */
            /* resize function to be called on pane mgmt also*/
            function onResize() {
                position();
            }

            /* delay call back on resize to allow transition to finish*/
            function delayedResize() {
                $timeout(function () {
                    onResize(true);
                }, 800);
            };

            function onDestroy() {
                $window.off('resize', onResize);
            }

            function tagVal(va) {
                return parseInt(($body.find(va.split(' ')[0]).css(va.split(' ')[1]) || va).replace(/px?/, ''));
            }

            if (tagCSS !== null) {
                tagCSS = tagVal(togglestatic);
            }

            switch (location) {
                case 'top':
                    elem.top = 0 + offset;
                case 'bottom':
                    elem.bottom = 0 - offset;
                    break;
                default:
                    anchor = 'bottom';
                    elem.bottom = 0 - offset;
                    break;
            }

            /* register left and right panes to resize sticky element */
            paneManager.registerLeftCallback(delayedResize);
            paneManager.registerRightCallback(delayedResize);

            function position() {
                if (tagCSS === null) {

                    if (windowHeight < parentHeight) {
                        $elem.css('position', initialCSS.position); // set position to initial css 
                    } else {
                        $elem.css('position', 'fixed'); 
                    } 

                } else {

                    if (tagCSS >= tagVal(togglestatic)) {
                        $timeout(function () { // delay for IE to properly render fixed
                            $elem.css('position', 'fixed'); 
                        }, 1200);
                        tagCSS = tagVal(togglestatic);
                    } else {
                        $elem.css('position', 'static'); // set position to static
                    }
                }
            }

            /* Listeners */
            $window.on('resize',  $scope.$apply.bind($scope, onResize));
            $scope.$on('$destroy', onDestroy);

            $scope.$watch(function() { 
                return $window.height();
            }, function(newVal) {
                    windowHeight = newVal;
                    position();
            });

            $scope.$watch(function() { 
                return parseInt($elem.parent().css('height').replace(/px?/));
            }, function(newVal) {
                    parentHeight = newVal;
                    position();
            });

        }

    }]);
}());

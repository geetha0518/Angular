/*
 * Directive to make html element "sticky" at top or bottom of scrolled page via attribute settings
 * usage: <element otherAttributes sticky [anchor=top{default} | bottom] [offset=<# pixels; {default: 0}>] [sticky-class=<classname>"] [<media-query="media expr.: #px]>...</element>
 * example: <div sticky anchor="top" sticky-class="stickyclass" media-query="min-width: 965px" offset="25"></div>
 */
 
(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.directive('sticky', ['paneManager', '$timeout', function (paneManager, $timeout) {
        return {
            restrict: 'A',
            link: stick
        };

        function stick($scope, $elem, $attrs) {
            var mediaQuery, stickyClass, bodyClass, elem, $window, $body,
                doc, initialCSS, initialStyle, stickyLine, offset, anchor,
                prevOffset, usePlaceholder, placeholder,
                isSticking      = false;

            /* elements */
            $window = angular.element(window);
            $body   = angular.element(document.body);
            elem    = $elem[0];
            doc     = document.documentElement;

            /* attributes */
            mediaQuery  = $attrs.mediaQuery  || false;
            stickyClass = $attrs.stickyClass || '';
            bodyClass   = $attrs.bodyClass   || '';

            usePlaceholder = $attrs.useplaceholder === typeof 'undefined' ? false : true;

            initialStyle = $elem.attr('style');

            offset = typeof $attrs.offset === 'string' ? parseInt($attrs.offset.replace(/px;?/, '')) : 0;

            anchor = typeof $attrs.anchor === 'string' ? $attrs.anchor.toLowerCase().trim() : 'top';

            /* initial style */
            initialCSS = {
                top:       $elem.css('top'),
                width:     $elem.css('width'),
                position:  $elem.css('position'),
                marginTop: $elem.css('margin-top'),
                cssLeft:   $elem.css('left')
            };

            switch (anchor) {
                case 'top':
                case 'bottom':
                    break;
                default:
                    anchor = 'top';
                    break;
            }

            /* Listeners */
            $window.on('scroll',  checkIfShouldStick);
            $window.on('resize',  $scope.$apply.bind($scope, onResize));
            $scope.$on('$destroy', onDestroy);

            /* resize function to be called on pane mgmt also*/
            function onResize() {
                initialCSS.offsetWidth = elem.offsetWidth;
                unstickElement();
                checkIfShouldStick();

                if (isSticking) {
                    var parent = window.getComputedStyle(elem.parentElement, null),
                        initialOffsetWidth = elem.parentElement.offsetWidth -
                            parent.getPropertyValue('padding-right').replace('px', '') -
                            parent.getPropertyValue('padding-left').replace('px', '');

                    $elem.css('width', initialOffsetWidth + 'px');
                }
            }

            /* delay call back on resize to allow transition to finish */
            function delayedResize() {
                $timeout(function () {
                    onResize();
                }, 550);
            };

            /* register left and right panes to resize sticky element */
            paneManager.registerLeftCallback(delayedResize);
            paneManager.registerRightCallback(delayedResize);

            function onDestroy() {
                $window.off('scroll', checkIfShouldStick);
                $window.off('resize', onResize);

                if (bodyClass) {
                    $body.removeClass(bodyClass);
                }

                if (placeholder) {
                    placeholder.remove();
                }
            }

            /* Watcher */
            prevOffset = _getTopOffset(elem);

            $scope.$watch( function() { /* triggered on load and on digest cycle */
                if ( isSticking ) {
                     
                    return prevOffset;
                }

                prevOffset = (anchor === 'top') ? _getTopOffset(elem) : _getBottomOffset(elem);

                
                return prevOffset;

            }, function(newVal, oldVal) {
                if ( newVal !== oldVal || typeof stickyLine === 'undefined' ) {
                    stickyLine = newVal - offset;
                    checkIfShouldStick();
                }
            });


            /* Methods */
            function checkIfShouldStick() {
                var scrollTop, shouldStick, scrollBottom, scrolledDistance;

                if (mediaQuery) {
                    return;
                }

                if (anchor === 'bottom') {
                    stickBottom();
                    return;
                }

                scrolledDistance = window.pageYOffset || doc.scrollTop;
                scrollTop        = scrolledDistance  - (doc.clientTop || 0);
                shouldStick      = scrollTop >=  stickyLine;

                /* Switch the sticky mode if the element crosses the sticky line */
                if (shouldStick && !isSticking) {
                    stickElement();
                } else if ( !shouldStick && isSticking ) {
                    unstickElement();
                }
            }

            function stickBottom() {
                var scrollBottom = window.pageYOffset + window.innerHeight;
                var pageHeight = $(document).height();

                // Subtract the height of the page we've scrolled through so far from the total page height.
                var distanceToBottom = pageHeight - scrollBottom;

                // The element will always stick to the bottom of the page at position zero.
                var position = 0;

                // Unless we've scrolled to the point that it is pushed up from the bottom of the page.
                if (distanceToBottom < offset) {
                    position = Math.round(offset - distanceToBottom);
                }

                $elem
                    .css('position', 'fixed')
                    .css('bottom', position + 'px');
            }

            function stickElement() {
                var rect, absoluteLeft, elemntsHeight;

                rect = $elem[0].getBoundingClientRect();
                absoluteLeft = rect.left;

                initialCSS.offsetWidth = elem.offsetWidth;

                isSticking = true;

                if (bodyClass) {
                    $body.addClass(bodyClass);
                }

                if (stickyClass) {
                    $elem.addClass(stickyClass);
                }

                $elem
                    .css('width',      elem.offsetWidth + 'px')
                    .css('position',   'fixed')
                    .css(anchor,       offset + 'px')
                    .css('left',       absoluteLeft + 'px')
                    .css('margin-top', 0);

                if (anchor === 'bottom') {
                    $elem.css('margin-bottom', 0);
                }

                if (usePlaceholder) {
                    placeholder = angular.element('<div>');
                    elemntsHeight = $elem.height();
                    placeholder.css('height', elemntsHeight + 'px');
                    $elem.after(placeholder);
                }
                                
            }

            function unstickElement() {
                $elem.attr('style', $elem.initialStyle);
                isSticking = false;

                if (bodyClass) {
                    $body.removeClass(bodyClass);
                }

                if (stickyClass) {
                    $elem.removeClass(stickyClass);
                }

                $elem
                    .css('width',      '')
                    .css('top',        initialCSS.top)
                    .css('position',   initialCSS.position)
                    .css('left',       initialCSS.cssLeft)
                    .css('margin-top', initialCSS.marginTop);

                if (placeholder) {
                    placeholder.remove();
                }
                                
            }

            function _getTopOffset (element) {
                var pixels = 0;

                if (element.offsetParent) {
                    do {
                        pixels += element.offsetTop;
                        element = element.offsetParent;
                    } while (element);
                }

                                
                return pixels;
            }

            function _getBottomOffset (element) {
                return element.offsetTop + element.clientHeight;
            }
        }
    }]);
}());

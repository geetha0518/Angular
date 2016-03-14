(function () {
    'use strict';

    var module = angular.module('fmc.components');

    var registerFooter = function (name, template) {
        module.directive(name, ['$window', 'ClientUserService', function ($window, ClientUserService) {
            return {
                restrict: 'EA',
                templateUrl: '/Scripts/app/components/user-experiences/views/' + template,
                link: function (scope, el, attr) {
                    scope.ClientUserService = ClientUserService;

                    scope.isFixed = function () {
                        var css = {};

                        var windowHeight = $window.innerHeight;
                        var centerPaneHeight = $(".center-pane").height();
                        var footer = $(".user-experience-footer");
                        var footerHeight = footer.height();

                        if (footer.hasClass("fixed-footer")) {
                            if ((centerPaneHeight + footerHeight)< windowHeight) {
                                return true;
                            }
                        } else {
                            if (centerPaneHeight < windowHeight) {
                                return true;
                            }
                        }

                        return false;
                    }
                }
            };
        }]);
    }

    registerFooter('userExperienceFooter', 'user-experience-footer.tpl.html');

    registerFooter('ficFooter', 'fic/fic-footer.tpl.html');
    registerFooter('fmcFooter', 'fmc/fmc-footer.tpl.html');
})();

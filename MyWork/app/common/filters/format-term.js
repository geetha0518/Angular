(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.filter('formatTerm', ['LabelService', function (LabelService) {
        return function (term, navigatorField) {
             switch (navigatorField) {
                case 'FOX.FIELD.FXSP_TAG_VERSION':
                    return LabelService.getTagVersionLabel(term);
                case 'FOX.FIELD.FXSP_EVENT_DATE':
                    return term.slice(0, 10);
                 case 'FOX.FIELD.FXSP_SPORT_KIND':
                     return LabelService.getFoxSportsLabel(term);
                default:
                    return term;
            }
        };
    }]);
})();
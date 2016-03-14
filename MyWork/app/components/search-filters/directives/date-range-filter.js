(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.directive('dateRangeFilter', [function () {
        return {
            restrict: 'E',
            scope: {
                fromDate: '=',
                toDate: '=',
                applyFilter: '=',
                minDate: '@',
                maxDate: '@',
                dateFormat: '@'
            },
            require: '^searchFilters',
            templateUrl: '/Scripts/app/components/search-filters/views/date-range-filter.tpl.html',
            link: function (scope, element, attrs, ctrl) {
                attrs.minDate = attrs.minDate || new Date('1/1/1900');
                attrs.maxDate = attrs.maxDate || new Date();
                attrs.dateFormat = attrs.dateFormat || 'MM/dd/yyyy';

                scope.ctrl = ctrl;
                scope.startOpened = false;
                scope.endOpened = false;
                scope.hasDateError = false;

                scope.$watch('fromDate', function (newVal, oldVal) {
                    validateDate();
                });

                scope.$watch('toDate', function (newVal, oldVal) {
                    validateDate();
                });

                var validateDate = function() {
                    scope.hasDateError = false;

                    // Users are allowed to submit either a start date, and end date, or both a start date and an end date.
                    // There will only be date errors if users submit both a start and an end date.
                    if (scope.fromDate && scope.toDate) {
                      var start = new Date(scope.fromDate);
                      var end = new Date(scope.toDate);

                      scope.hasDateError = start > end;
                    }

                    scope.ctrl.setDateError(scope.hasDateError);
                };
            }
        }
    }]);
})();

(function () {
    'use strict';

    var module = angular.module('fmc.revision', []);

    module.directive('revision', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/Scripts/app/components/revision-icon/views/revision.tpl.html',
                scope: {
                    datasource: '=?'
                },
                link: function ($scope, element) {

                    $scope.hasRevision = function () {
                        if (!$scope.datasource) {
                            return false;
                        } else {
                            return ($scope.datasource.version > 1 || $scope.datasource.revision > 0);
                        }
                        
                    };

                }
            };
        }
    );
})();
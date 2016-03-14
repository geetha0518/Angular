(function () {
    'use strict';

    var module = angular.module('fmc.assets');

    module.directive('audioDetailsTable', function () {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/assets/views/audio-details-table.tpl.html',
            scope: {
                cells: '='
            },
            controller: function($scope) {
                $scope.tableHeaders = []
                $scope.tableRows = [];

                $scope.tableHasData = false;

                // prone to errors with unexpected field esprit key
                _.each(
                    _.groupBy($scope.cells, function (item) {
                        return item.espritKey.match(/(FOX.FIELD.AUDIO_CHANNEL_|FOX.FIELD.FIC_ISO_LANG_CH)(..)/)[2]
                    }),
                    function (item, key) {
                        if ($scope.tableHeaders.length === 0) {
                            // prone to errors due to changes in the field Title
                            $scope.tableHeaders = _.map(item, function (article) {
                                var header = article.fieldTitle.substring(0, article.fieldTitle.indexOf("-ch" + key)).trim();

                                if (!header) {
                                    var subStart = ("Audio Channel " + key).length;
                                    header = article.fieldTitle.substring(subStart).trim();
                                }

                                return header;
                            });

                            $scope.tableHeaders.unshift("Channel")
                        }

                        var index = Number(key);

                        var rowData = _.map(item, function (article) {
                            // The table won't show unless any cell actually has data.
                            if (article.value) {
                                $scope.tableHasData = true;
                            }

                            return article.value;
                        });

                        $scope.tableRows[index] = rowData;
                        $scope.tableRows[index].unshift(key);
                    });
            }
        };
    });
})();

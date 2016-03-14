(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service("ExportToFileService", ["$window", "$http", "$analytics", "AssetSearchService", 'SortOptionsService',
        function ($window, $http, $analytics, AssetSearchService, SortOptionsService) {
        this.service = AssetSearchService;

        this.exportToContactSheet = function (selectedAssets) {
            var sortTerm = _.find(SortOptionsService.sortOptions, function (item) {
                return item.selected;
            });

            var assetIds = _.map(selectedAssets, function (item) { return item.assetId; }).join(',');

            $analytics.eventTrack('Create PDF', { category: 'Action Bar'});

            serveFileInPage('/export/contactsheet?assetIds=' + assetIds + '&sortField=' + sortTerm.field + '&sortOrder=' + sortTerm.order,
                'FOX_Media_Cloud_' + Date.now());
        };

        var serveFileInPage = function (fileUrl, filename) {
            var link = document.createElement("a");

            // Browser supports this? (Supported in Chrome 14+ / Firefox 20+)
            if ("download" in link) {
                link.setAttribute("href", fileUrl);
                link.setAttribute("target", filename);

                // Simulate clicking the download link
                var event = document.createEvent('MouseEvents');

                event.initMouseEvent('click', true, true, $window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                link.dispatchEvent(event);
            } else {
                // Fall back to window location with octetStream to force download
                $window.open(fileUrl, '_blank');
            }
        };
    }]);
})();


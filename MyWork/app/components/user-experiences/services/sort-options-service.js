(function () {
    'use strict';

    var module = angular.module('fmc.components');
    
    module.service('SortOptionsService', ['ClientUserService', function (ClientUserService) {
        var fieldDisplayNames = {
            'ARTESIA.FIELD.DATE_IMPORTED': 'Date Uploaded',
            'FOX.FIELD.TITLE': 'Title',
            'ARTESIA.FIELD.ASSET_NAME': 'Asset Name',
            'FOX.FIELD.FIC_SHOW_NAME': 'Title'
        };

        var createSortOption = function (term, isAscending) {
            var displayName = fieldDisplayNames[term];
            var displayNameLabel = isAscending ? "Ascending" : "Descending";
            var order = isAscending ? "asc" : "desc";

            var option = {
                displayName: displayName + " " + displayNameLabel,
                field: term,
                order: order
            };

            return option;
        }

        // Build ascending and descending sort options for each sort option.
        var buildSortOptions = function () {
            var finalOptions = [];
            var terms = ClientUserService.getSortTerms();

            _.each(terms, function (term) {
                // Order is important. Descending must appear before ascending.
                var descending = createSortOption(term, false);
                var ascending = createSortOption(term, true);
                finalOptions.push(descending);
                finalOptions.push(ascending);
            })

            return finalOptions;
        };

        this.sortOptions = buildSortOptions();

        // Define defaults.
        this.defaultSort = this.sortOptions[0];
        this.defaultSort.selected = true;
    }]);
})();

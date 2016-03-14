(function () {
    'use strict';

    var module = angular.module('fmc.components');
    module.service('SearchExperience', ['ClientUserService', function (ClientUserService) {
        this.placeholderText = function (searchBarName) {
            var placeholder = '';

            // Fill in when ticket is complete.
            if (searchBarName === "left-pane-search") {
                if (ClientUserService.isFic) {
                    placeholder = "Modify Search (e.g. Title)";
                } else if (ClientUserService.isFoxSports) {
                    placeholder = "Modify Search (e.g. Sport)";
                } else {
                    placeholder = "Modify Search (e.g. File Name)";
                }
            } else if (searchBarName === "homepage-search") {
                if (ClientUserService.isFic) {
                    placeholder = "Start a new search (e.g. Title, Paradigm ID)";
                } else if (ClientUserService.isFoxSports) {
                    placeholder = "Start a new search (e.g. Sport, Promo Code)";
                } else {
                    placeholder = "Start a new search (e.g. File Name, Asset ID)";
                }
            } else if (searchBarName === "navigation-search") {
                if (ClientUserService.isFic) {
                    placeholder = "Start a new search (e.g. Title, Paradigm ID)";
                } else if (ClientUserService.isFoxSports) {
                    placeholder = "Start a new search (e.g. Sport, Promo Code)";
                } else {
                    placeholder = "Start a new search (e.g. File Name, Asset ID)";
                }
            }

            return placeholder;
        }
    }]);
})();

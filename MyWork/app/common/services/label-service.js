(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('LabelService', ['$http', 'ClientUserService',
    function ($http, ClientUserService) {
        var fieldValuesUrlBase = '/api/search/fieldvalues/';
        var tagVersionLabels = {};
        var foxSportsLabels = {};

        var downloadLabels = {
            source: "Source",
            preview : "Preview"
        };

        var transferStatusLabels = {
                'READY_FOR_DOWNLOAD': 'PROCESSING',
                'SCHEDULE_FAILED': 'UNABLE TO PROCESS', 
                'TRANSFER_COMPLETED': 'COMPLETED', 
                'TRANSFER_IN_PROGRESS': 'IN PROGRESS',  
                'TRANSFER_FAILED': 'FAILED'
        };

        var loadfieldValues = function(field) {
            return $http.get(fieldValuesUrlBase + field + '/');
        }

        var checkMovExtension = function (assets) {
            var hasMovExtension = _.some(assets, function (asset) {
                return asset.fileType === 'mov';
            });

            return hasMovExtension;
        }

        this.getDownloadLabels = function (user, assets ) {
            var isFoxSports = ClientUserService.isFoxSports;
            var hasMovExtension = checkMovExtension(assets);
           
            if (isFoxSports && hasMovExtension) {
                downloadLabels.source = "DNX - Hi Bandwidth";
                downloadLabels.preview = "h.264 - Low Bandwidth";
            } else {
                downloadLabels.source = "Source";
                downloadLabels.preview = "Preview";
            }

            return downloadLabels;
        };

        this.getTransferStatusLabels = function (input) {
            return transferStatusLabels[input];
        };

        this.getTagVersionLabel = function (tagVersionId) {
            
            var tagVersionLabel = tagVersionLabels[tagVersionId];
            return tagVersionLabel;
        };

        this.getFoxSportsLabel = function (foxFieldId) {
            var foxSportsLabel = foxSportsLabels[foxFieldId];
            return foxSportsLabel;
        }

        var transferFieldLabel = {
            "filename": "1",
            "transactionId": "2",
            "requestedByName": "3",
            "statusDateTime": "4",
            "statusDescription": "5",
            "updateDateTime": "6",
            "destinationName": "7"
        };

        this.getTransferFieldId = function ( fieldLabelName) {
            var transferFieldId = transferFieldLabel[fieldLabelName];
            return transferFieldId;
        };

        var collectionFieldLabel = {
            "fileName": "1",
            "collection": "2",
            "assetType": "3",
            "teamEvent": "4",
            "promoCode": "5",
            "sport": "6",
            "tagVersion": "7",
            "promoStartDate": "8",
            "uploadDate": "9",
            "duration": "10"

        };

        this.getCollectionFieldId = function (fieldLabelName) {
            var CollectionFieldId = collectionFieldLabel[fieldLabelName];
            return CollectionFieldId;
        };

        var init = function() {
            loadfieldValues('FOX.FIELD.FXSP_TAG_VERSION').then(function(response) {
                if (response.data) {
                    angular.forEach(response.data, function(value, key) {
                        tagVersionLabels[value.espritValueID] = value.displayName;
                    });
                }
            });

            loadfieldValues('FOX.FIELD.FXSP_SPORT_KIND').then(function (response) {
                if (response.data) {
                    angular.forEach(response.data, function (value, key) {
                        foxSportsLabels[value.espritValueID] = value.displayName;
                    });
                }
            });
        }

        init();
    }]);
})();
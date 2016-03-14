(function () {
    'use strict';

    var module = angular.module('fmc.components');

    module.service('CollectionFormService', ['$modal',  function ($modal) {

        this.openDialog = function () {

            var modalHandler = $modal.open({
                templateUrl: '/Scripts/app/components/collections-form/views/collection-form.tpl.html',
                controller: 'CollectionFormController',
                size: 'sm'
            });
        };


        this.openNotificationDialog = function(collections) {
            var modalHandler = $modal.open({
                templateUrl: '/Scripts/app/collections/views/collection-asset-notification.tpl.html',
                controller: 'CollectionNotificationModalController',
                resolve: {
                    closeNotificationDialog: function () {
                        return function () {
                            if (modalHandler) {
                                modalHandler.close();
                            }
                        }
                    },
                    selectedCollections: function() {
                        return collections;
                    }
                },
                windowClass: "collection-modal"
            });
        }

    }]);
})();

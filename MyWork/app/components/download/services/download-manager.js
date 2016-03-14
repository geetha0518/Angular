/// <reference path="download-manager.js" />
(function () {
    'use strict';

    var module = angular.module('fmc.download');
    
    module.service('DownloadManager', ['$rootScope', '$modal', 'DownloadFactory', 'paneManager', function ($rootScope, $modal, DownloadFactory, paneManager) {
        var modalHandler;

        // grant access to this within other functions.
        var that = this;

        var isModalOpen = false;

        this.newModal = function (assets) {
            
            if (assets && !Array.isArray(assets)) {
                assets = [assets];
            }

            that.displayModal(false, assets);
        };

        this.reopenModal = function () {
            this.displayModal(true);
        }

        this.displayModal = function (reopened, assets) {
            // prevent multiple modals from opening at once.
            if (isModalOpen && !reopened) {
                return;
            }

            paneManager.toggleIsDownloadMinimized(false);

            isModalOpen = true;

            modalHandler = $modal.open({
                templateUrl: '/Scripts/app/components/download/views/download-asset-screen.tpl.html',
                size: 'lg',
                controller: 'DownloadCtrl',
                keyboard: false, 
                resolve: {
                    closeDialog: function () {
                        return function () {
                            if (modalHandler) {
                                isModalOpen = false;
                                // remove the completed transfers from the Aspera Connect plugin too:
                                DownloadFactory.clearAssetsCompletedInPlugin();
                                modalHandler.dismiss('cancel');
                            }

                        }
                    },
                    reopened: function () {
                        return reopened;
                    },
                    assets: function () {
                        return assets;
                    }
                },
                backdrop: 'static'
            });

            modalHandler.result.then(
                function (selectedItem) { },
                function () {
                    DownloadFactory.clearAssetsToTransfer();
                    DownloadFactory.clearCompletedTransfers();
                    
                    if (DownloadFactory.getCurrentTransfers().length > 0 && !DownloadFactory.isTransferSessionFailed) {
                        paneManager.toggleIsDownloadMinimized(true);
                    }
                });
        };
    }]);
})();
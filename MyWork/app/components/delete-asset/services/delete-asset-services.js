(function () {
    'use strict';

    var module = angular.module('fmc.delete');

    module.service('deleteAssetService', [
         '$rootScope', '$modal', '$http', 'paneManager', '$analytics',
        function ($rootScope, $modal,$http, paneManager, $analytics) {
            var modalHandler;

            // grant access to this within other functions.
            var that = this;

            var isModalOpen = false;

            this.newModal = function (assets) {

                if (assets && !Array.isArray(assets)) {
                    assets = [assets];
                }

                that.deleteAssetsDialog(false, assets);
            };

            this.reopenModal = function () {
                this.deleteAssetsDialog(true);
            }

            this.deleteAssetsDialog = function (reopened, assets) {
                if (isModalOpen && !reopened) {
                    return;
                }

                modalHandler = $modal.open({
                    templateUrl: '/Scripts/app/components/delete-asset/views/delete-asset.tpl.html',
                    controller: 'DeleteAssetsCtrl',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        closeDeleteAssetsDialog: function() {
                            return function() {
                                if (modalHandler) {
                                    modalHandler.close();
                                }
                            }
                        },
                        reopened: function() {
                            return reopened;
                        },
                        collectionAssets: function() {
                            return assets;
                        }
                    },
                    windowClass: "collection-modal"
                });
            };

            var getAssetIds = function (assets) {
                if (Array.isArray(assets)) {
                    return _.map(assets, function (item) { return item.assetId; });
                }

                return [assets.assetId];
            };

            this.deleteassets = function (assets) {
                var assetId = getAssetIds(assets);

                $analytics.eventTrack('Delete', { category: ' ' });
                return $http.delete('/api/assets/' + assetId, { params: { assetId: assetId } });
            };
        }]);
})();
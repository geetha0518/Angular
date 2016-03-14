(function () {
    'use strict';

    var module = angular.module('fmc.download');

    module.directive('downloadFooter', ['$analytics', '$window', 'paneManager', 'DownloadManager', 'DownloadFactory', 'OverallProgress',
        function ($analytics, $window, paneManager, DownloadManager, DownloadFactory, OverallProgress) {
        return {
            restrict: 'E',
            templateUrl: '/Scripts/app/components/download/views/download-footer.tpl.html',
            link: function (scope) {

                scope.currentDownloads = DownloadFactory.getCurrentTransfers();

                scope.init = function () {
                    scope.overallProgress = 0;
                    scope.overallTimeRemaining = 0;
                    scope.overallBytes_expected = 0;
                    scope.overallBytes_written = 0;
                    scope.transfersCompleted = 0;
                    scope.transfersInProgress = 0;
                    scope.showCloseButton = false;
                    scope.transferCanceled = false;
                    scope.downloadComplete = false;
                };

                var computePosition = function () {
                    var footerTop = $(".user-experience-footer").position().top;
                    var bottom = $(window).scrollTop() + window.innerHeight - footerTop;
                    bottom = Math.ceil(bottom);
                    bottom = Math.max(bottom, 0);

                    $(".download-footer").css({ bottom: bottom  + "px"});
                }

                angular.element($window).bind("scroll", computePosition);
                angular.element($window).bind("resize", computePosition);

                // adding a commented line just for testing
                scope.reopenDialog = function () {
                    paneManager.toggleIsDownloadMinimized(false);

                    $analytics.eventTrack('Maximize', { category: 'Download' });

                    DownloadManager.reopenModal();

                    if (scope.transferCanceled) {
                        scope.init();
                    }
                };

                scope.hasCurrentTransfers = function (){
                    return scope.currentDownloads.length > 0;
                }
                
                scope.closeFooter = function () {
                    paneManager.toggleIsDownloadMinimized(false);
                    DownloadFactory.clearAssetsCompletedInPlugin();
                    scope.init();
                };

                scope.hasAssetsTransfering = function () {
                    return DownloadFactory.getCurrentTransfers() > 0;
                };

                scope.getCompleted = function () {
                    var count = 0;
                    angular.forEach(DownloadFactory.getCurrentTransfers(), function (item) {
                        if(item.transfer.status === 'completed'){
                            count += 1;
                        }
                    });
                    return count;

                };

                scope.$on('broadcastTransferProgress', function (event, newObj) {
                   
                    if (newObj.status === 'failed') {
                        $analytics.eventTrack('Failure', { category: 'Download' });
                    }

                    if (newObj.status === 'willretry') {
                        $analytics.eventTrack('WillRetry', { category: 'Download' });
                    }

                    var assetToUpdate = _.find(DownloadFactory.getCurrentTransfers(), function (asset) {
                        if (newObj.assetId !== undefined) {
                            if (asset.assetId === newObj.assetId) {
                                return asset;
                            }
                        } else {
                            if (asset.transfer.target_title === newObj.title) {
                                return asset;
                            }
                        }
                    });

                    if(assetToUpdate !== undefined){
                        assetToUpdate.transfer.progress = (newObj.percentage * 100);
                        assetToUpdate.transfer.status = newObj.status;
                        assetToUpdate.transfer.timeRemaining = (newObj.remaining_usec / 1000000);
                        assetToUpdate.transfer.bytes_expected = newObj.bytes_expected;
                        assetToUpdate.transfer.bytes_written = newObj.bytes_written;
                        assetToUpdate.transfer.calculated_rate_kbps = newObj.calculated_rate_kbps;
                    }

                    var transferProgress = newObj.status !== 'removed' ?
                        OverallProgress.calculate(DownloadFactory.getCurrentTransfers()) :
                        OverallProgress.reset();

                    scope.overallProgress = transferProgress._overallProgress;
                    scope.overallTimeRemaining = transferProgress._overallTimeRemaining;
                    scope.overallBytes_expected = transferProgress._overallBytes_expected;
                    scope.overallBytes_written = transferProgress._overallBytes_written;
                    scope.transfersInProgress = DownloadFactory.getCurrentTransfers().length;

                    scope.transfersCompleted = scope.getCompleted();

                    if ((scope.transfersCompleted - scope.transfersInProgress) === 0 || scope.transferCanceled) {
                        scope.showCloseButton = true;
                        scope.downloadComplete = true;

                     } else {
                        scope.showCloseButton = false;
                        scope.downloadComplete = false;
                    }

                    _.defer(function () {
                        scope.$apply();
                    });
                });

                scope.$on('broadcastCanceled', function (event, newObj) {
                    scope.transferCanceled = true;
                });

                scope.init();
            }
        };
    }]);
})();

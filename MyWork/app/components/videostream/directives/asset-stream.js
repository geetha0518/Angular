(function () {
    'use strict';

    var module = angular.module('fmc.videostream');

    module.directive('videoStream', ['$rootScope','$modal', '$http', '$analytics', 'ClientUserService', function ($rootScope, $modal, $http, $analytics, clientUserService) {
        return {
            restrict: 'EA',
            templateUrl: '/Scripts/app/components/videostream/views/video-stream-button.tpl.html',
            transclude: false,
            scope: {
                asset: '=?',
                label: '=?'
            },
            link: function (scope, element) {
                var modalHandler;
                var assetName = "";

                scope.ClientUserService = clientUserService;

                scope.$on('stream-asset', function (e, data) {
                    scope.openDialog(data.assetId, data.fileName);
                });

                scope.openDialog = function (assetId, assetFileName) {
                    assetName = assetFileName;
                    var modalData = { title: 'Loading' };
                    displayModal('/Scripts/app/components/videostream/views/video-stream.tpl.html', modalData);
                    checkStreaming(assetId)
                        .then(function(response) {
                            if (response.data.status === '0') {
                                modalData.title = 'Asset Preview';
                                modalData.status = response.data.status;
                                modalData.config = response.data.config;
                                $analytics.eventTrack('Launch Player', { category: 'Video', label: assetFileName });
                                $rootScope.$broadcast('streamReceived');
                            } else {
                                modalData.title = 'An error has occured';
                            }

                        }, function() {
                            modalData.title = 'An error has occured';
                        });
                };

                var checkStreaming = function (assetId) {
                    return $http.get("/api/AssetStream/" + assetId);
                };

                var logEvent = function (event) {

                    if (event.type === "seeking") {
                        $analytics.eventTrack('Scrub', { category: 'Video', label: assetName, value: event.data.time });
                        return;
                    }
                    var eventType = "";

                    if (event.type === "playing") {
                        eventType = "Play";
                    }

                    if (event.type === "pause") {
                        eventType = "Pause";
                    }

                    if (event.type === "ended") {
                        eventType = "Finished";
                    }

                    $analytics.eventTrack(eventType, { category: 'Video', label: assetName });
                };

                var displayModal = function (tempUrl, mData) {
                    modalHandler = $modal.open({
                        templateUrl: tempUrl,
                        size: 'sm',
                        windowClass: 'modal-streaming',
                        controller: 'VideoStreamCtrl',
                        resolve: {
                            closeDialog: function () {
                                return function () {
                                    if (modalHandler) {
                                        $analytics.eventTrack('Close Player', { category: 'Video', label: assetName });
                                        modalHandler.close();
                                    }
                                }
                            },
                            streamPreview: function () {
                                return function(data) {
                                    if (data && data.status === '0') {
                                        data.config.autoplay = true;
                                        akamai.amp.AMP.loadDefaults("/static/AkamaiConfiguration");

                                        setTimeout(function() {
                                            var configOverrides = data.config;
                                            var amp = new akamai.amp.AMP("akamai-media-player", configOverrides);

                                            amp.addEventListener("playing", logEvent);
                                            amp.addEventListener("pause", logEvent);
                                            amp.addEventListener("ended", logEvent);
                                            amp.addEventListener("seeking", logEvent);
                                        }, 1000);
                                    }
                                }
                            },
                            modalData: function () {
                                return mData;
                            }
                        }
                    });

                    return modalHandler;
                };
            }
        };
    }]);
})();
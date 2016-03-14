(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('paneManager', ['SessionService', function (SessionService) {
        //RR - this can be disabled initially
        this.panesEnabled = false;

        // left pane
        var leftCallbacks = [];
        this.leftOpen = false;

        // right pane
        var rightCallbacks = [];
        this.rightOpen = false;
        this.rightAsset = null;

        // footer
        this.isDownloadMinimized = false;
        
        // Toggles the pane between open and closed, or sets state to the value given.
        this.toggleRight = function (open, asset) {
            if (typeof open !== 'undefined' && typeof asset !== 'undefined' && asset !== null) {
                this.rightOpen = open;
            } else {
                this.rightOpen = null;
            }

            if (typeof asset !== 'undefined') {
                this.rightAsset = asset;
            } else {
                this.rightAsset = null;
            }


            // 'this' isn't the same 'this' inside the _.each
            var that = this;
            _.each(rightCallbacks, function (cb) {
                cb(that.rightOpen, that.rightAsset);
            });
        }

        // Left Pane
        this.toggleLeft = function (open) {
            if (typeof open !== 'undefined') {
                this.leftOpen = open;
            } else {
                this.leftOpen = !this.leftOpen;
            }

            // 'this' isn't the same 'this' inside the _.each
            var that = this;
            _.each(leftCallbacks, function (cb) {
                cb(that.leftOpen);
            });
        };

        // Minimized download footer
        this.toggleIsDownloadMinimized = function (isMinimized) {
            if (typeof isMinimized !== 'undefined') {
                this.isDownloadMinimized = isMinimized
            } else {
                this.isDownloadMinimized != this.isDownloadMinimized;
            }
        }

       
        // Other code can't use $watch to see when leftOpen changes in this Service.
        this.registerLeftCallback = function (cb) {
            leftCallbacks.push(cb);
        };

        this.registerRightCallback = function (cb) {
            rightCallbacks.push(cb);
        };
    }]);
})();

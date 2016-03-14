(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('BrowserCheckService', ['deviceDetector', 'BrowserMins', 
    function ( deviceDetector, BrowserMins ) {

        this.deviceDetector = deviceDetector;
        this.msgStart = 'You are using ';
        this.msgEnd = '. You should use the latest version of your browser for this site to work properly. Please update your browser and try again.';
        this.upgradeMessage = '';
        this.BrowserMins = BrowserMins;
        this.chromeVersion = '';

        //check supported versions for current windows o/s
        this.checkBrowser = function () {
            if (this.deviceDetector.os == 'windows') {
                if (this.deviceDetector.raw.browser.firefox) {
                    if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.firefox) == true) {
                            this.upgradeMessage = this.msgStart + 'Mozilla Firefox ' + this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                    }
                }
                else if (this.deviceDetector.raw.browser.chrome) {
                    if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.chrome) == true) {
                            this.upgradeMessage = this.msgStart + 'Google Chrome ' + this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                    }
                }
                else if (this.deviceDetector.raw.browser.ie) {
                    if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.ie) == true) {
                            this.upgradeMessage = this.msgStart + 'Microsoft Internet Explorer ' +this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                    }
                }
                // ignore all others;
            }// end windows check

             //check supported versions for mac o/s 
            else if (this.deviceDetector.os == 'mac') {
                if (this.deviceDetector.raw.browser.firefox) {
                    if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.firefox) == true) {
                            this.upgradeMessage = this.msgStart + 'Mozilla Firefox ' + this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                    }
                }
                else if (this.deviceDetector.raw.browser.chrome) {
                    if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.chrome) == true) {
                            this.upgradeMessage = this.msgStart + 'Google Chrome ' + this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                    }
                }
                else if (this.deviceDetector.raw.browser.safari) {
                     if (this.recommendBrowserUpgrade(this.deviceDetector.browser_version, this.BrowserMins.safari) == true) {
                            this.upgradeMessage = this.msgStart + 'Apple Safari ' + this.deviceDetector.browser_version + this.msgEnd;
                            return true;
                     }
                }
            }//end mac o/s check
            return false;
        }

        //compares version numbers with dot format (e.g. useful for Chrome version numbers like 40.0.2214)
        //if user's version is less than the minimum recommended version function returns true
        this.recommendBrowserUpgrade = function (userVersion, minimumRecommendedVersion) {

            var result = false;

            if (typeof userVersion !== 'object') { userVersion = userVersion.toString().split('.'); }
            if (typeof minimumRecommendedVersion !== 'object') { minimumRecommendedVersion = minimumRecommendedVersion.toString().split('.'); }

            for (var i = 0; i < (Math.max(userVersion.length, minimumRecommendedVersion.length)) ; i++) {

                if (userVersion[i] == undefined) { userVersion[i] = 0; }
                if (minimumRecommendedVersion[i] == undefined) { minimumRecommendedVersion[i] = 0; }

                if (Number(userVersion[i]) < Number(minimumRecommendedVersion[i])) {
                    result = true;
                    break;
                }
                if (userVersion[i] != minimumRecommendedVersion[i]) {
                    break;
                }
            }

            return (result);
        }

        this.checkChromeAsperaSupport = function () {

            var browser = this.deviceDetector.browser;
            this.chromeVersion = this.deviceDetector.browser_version.split('.')[0];
            //Note... only use this condition if required to force version
            //var isWarningVersion = this.chromeVersion >= 45;

            if (browser === 'chrome' ) {
                return true;
            }
            return false;

        };

    }]);
})();
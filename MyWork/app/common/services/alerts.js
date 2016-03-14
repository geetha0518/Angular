(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('AlertsService', ['$q', 'messageService',
            function($q, messageService) {
        this.flashError = function(message) {
            messageService.emit('fmc.common.alert-error', message);
        };

        this.flashSuccess = function(message) {
            messageService.emit('fmc.common.alert-success', message);
        };

        this.modalAlert = function(message, title) {
            return BootstrapDialog.show({
                title: title || 'Alert',
                message: message,
                buttons: [{
                    label: 'Ok',
                    action: function(dialog) {
                        dialog.close();
                    }
                }]
            });
        };

        // An example of how to invoke modalPrompt:
        //
        // alertsService.modalPrompt("Create Workspace", "Do you really want to delete this workspace?", "yes", "no").then(
        //    function(cancelOption) {
        //        // cancel or do nothing
        //    }, function(confirmOption) {                
        //        // delete the workspace.
        //    });
        this.modalPrompt = function(title, message, cancelOption, confirmOption) {
            var deferred = $q.defer();
            BootstrapDialog.show({
                title: title,
                message: message,
                buttons: [{
                    label: cancelOption,
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        deferred.resolve(cancelOption);
                        dialog.close();
                    }
                }, {
                    label: confirmOption,
                    cssClass: 'btn-warning',
                    action: function(dialog) {
                        deferred.reject(confirmOption);
                        dialog.close();
                    }
                }]
            });
            return deferred.promise;
        };
    }]);
})();
(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('ClientUserService', ['ipCookie', 'UserRoleConstants','$log',
    function (ipCookie, UserRoleConstants,$log) {
        
        var cookieName = 'ClientUser';

        var getCookie = function () {
            var cookie = angular.fromJson(ipCookie(cookieName));
            return cookie;
        };
        
        var user = function () {
            var cookie = getCookie();
            
            var userInfo = {
                displayName: cookie.displayName,
                firstName: cookie.firstName,
                lastName: cookie.lastName,
                primaryCollection: cookie.primaryCollectionId,
                role: cookie.userRole,
                permissions: cookie.permissions,
                isACollectionOwner: cookie.isACollectionOwner,
                isAbleViewTransfers: cookie.userRole === UserRoleConstants.FOX_SPORTS_MEDIA_SERVICES || cookie.isAutoDownloaderCollectionOwner,
                //Fic Flags
                isFicCustomer: cookie.userRole === UserRoleConstants.FIC_CUSTOMER,
                isFicTrafficer: cookie.userRole === UserRoleConstants.FIC_TRAFFICKER
                //End Fic Flags
            };
            $log.info('displayName ' + cookie.displayName);
            return userInfo;
        }

        var roles = function () {
            var cookie = getCookie();
            return _.object(cookie.roles, cookie.roles);
        }

        var cachedUser;
        this.getCurrentUser = function () {
            if (cachedUser) {
                return cachedUser;
            } else {
                cachedUser =  user();
            }

            return cachedUser;
        };

        this.getUserRoles = function () {
            return roles();
        };


        this.getSortTerms = function () {
            var cookie = getCookie();
            return cookie.sortTerms;
        }

        var fmcRoles = [UserRoleConstants.FOX_MEDIA_CLOUD];
        var ficRoles = [UserRoleConstants.FIC_TRAFFICKER, UserRoleConstants.FIC_CUSTOMER];
        var foxSportsRoles = [UserRoleConstants.FOX_SPORTS_AFFILIATE, UserRoleConstants.FOX_SPORTS_APPROVER, UserRoleConstants.FOX_SPORTS_MEDIA_SERVICES];

        this.isFmc = _.contains(fmcRoles, user().role);
        this.isFic = _.contains(ficRoles, user().role);
        this.isFoxSports = _.contains(foxSportsRoles, user().role);
        
        this.getRoleLabelByValue = function () {
            for (var prop in UserRoleConstants) {
                if (UserRoleConstants.hasOwnProperty(prop)) {
                    if (UserRoleConstants[prop] === user().role)
                        return prop;
                }
            }
        };
    }]);

    module.constant('UserRoleConstants', {
        FOX_MEDIA_CLOUD: 'fmcExp',
        FIC_TRAFFICKER: 'ficTrafficker',
        FIC_CUSTOMER: 'ficCustomer',
        FOX_SPORTS_AFFILIATE: 'fxspAffiliate',
        FOX_SPORTS_APPROVER: 'fxspApprover',
        FOX_SPORTS_MEDIA_SERVICES: 'fxspMediaServices', 
    });
})();

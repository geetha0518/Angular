(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service("AuthorizationService", ["$state", "ClientUserService", function ($state, ClientUserService) {
        this.stateChangeStartHandler = function (e, toState, toParams, fromState, fromParams) {
            var user = ClientUserService.getCurrentUser();
            var authorization = extendAuthorization(toState.authorization);
            // User is allowed to continue through to the state.
            if (authorization.userIsAllowed(user)) {
                // Do nothing; user is allowed this route
                return;

            // User is NOT allowed to continue through to the state.
            } else if (authorization.userIsDenied(user)) {
                var route = authorization.redirectRoute(user.role);

                if (route) {
                    e.preventDefault();
                    $state.go(route.route, route.data || {});

                    return;
                }
            }

            // All deny conditions not specifically targeted
            e.preventDefault();
            $state.go(authorization.failOver);
        };

        var extendAuthorization = function (routeAuthorization) {
            var fullAuthorization = {
                allowAll: false,
                denyAll: false,
                allowRoles: [],
                denyRoles: [],
                requiredPermissions: [],
                failOver: 'help',

                userIsAllowed: function (user) {
                    var roleAllowed = this.allowAll || !this.userIsDenied(user) || _.contains(this.allowRoles, user.role);
                    var hasPermissions = this.hasRequiredPermissions(user.permissions);

                    return roleAllowed && !this.denyAll && hasPermissions;
                },

                userIsDenied: function (user) {
                    if (!this.denyAll) {

                        var entry = _.find(this.denyRoles, function (item) {
                            return item.role == user.role;
                        });

                        return !!entry;
                    }

                    return !this.hasRequiredPermissions(user.permissions);
                },

                // Checks to see if the user has all the required permissions
                hasRequiredPermissions: function (userPermissions) {
                    if (this.requiredPermissions.length === 0) {
                        return true;
                    }

                    var resolvedPermissions = _.map(this.requiredPermissions, function (item) { return userPermissions[item]; });

                    // If any permissions resolved to false
                    return !_.contains(resolvedPermissions, false)
                },

                redirectRoute: function (userRole) {
                    var entry = _.find(this.denyRoles, function (item) {
                        return item.role == userRole;
                    });

                    return entry;
                }
            };

            return _.extend(fullAuthorization, routeAuthorization);
        };
    }]);
})();

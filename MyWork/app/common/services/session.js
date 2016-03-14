(function () {
    'use strict';

    var module = angular.module('fmc.common');

    module.service('SessionService', [function () {
        var localStorageKey = "sessiondata";
        var data = {
    };

        var Session = {
                set: function(key, value) {
                    if(key) {
                    data[key]= value;
                    }
                    // Save everything for now. Change this if saves become an expensive operation.
                    Session.save();
                },
                get: function (key, defaultVal) {
                    var value = undefined;

                    if (key) {
                    if (data[key]!= undefined) {
                        value = data[key];
                    } else if (defaultVal != undefined) {
                        value = defaultVal;
                    }
                    }

                    return value;
                },
                save: function () {
                    // save to db 
                    var json = angular.toJson(data);
                    localStorage.setItem(localStorageKey, json);
                },
                load: function() {
                    // load from db
                    var localStore = localStorage.getItem(localStorageKey);
                    if (localStore) {
                        data = angular.fromJson(localStore);
                    }
                    return data;
                },
                clear: function () {
                    localStorage.setItem(localStorageKey, { });
                    localStorage.clear();
                },
                setKeyPattern: function (keyPattern, value) {
                    var localData = Session.load();
                    for (var property in localData) {
                        if (property.indexOf(keyPattern+'')>0) {
                            Session.set(property, value);
                        }
                    }
                }
            };

        Session.load();

        return Session;
    }]);
}) ();
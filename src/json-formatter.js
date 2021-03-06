'use strict';

angular.module('jsonFormatter', ['RecursionHelper'])
.directive('jsonFormatter', ['RecursionHelper', function (RecursionHelper) {

    function escapeString(str) {
        return str.replace('"', '\"');
    }

    // From http://stackoverflow.com/a/332429
    function getObjectName(object) {
        if (object === undefined) {
            return '';
        }
        if (object === null) {
            return 'Object';
        }
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((object).constructor.toString());
        if (results && results.length > 1) {
            return results[1];
        } else {
            return '';
        }
    }

    function link(scope, element, attributes) {
var parentJson = scope.json;
if (scope.key) {
    scope.json = scope.json[scope.key];
}
        scope.isArray = function () {
            return Array.isArray(scope.json);
        };


        scope.isObject = function() {
            return scope.json && typeof scope.json === 'object';
        };

        scope.getKeys = function (){
            if (scope.isObject()) {
                return Object.keys(scope.json);
            }
        };
        scope.type = typeof scope.json;
        scope.hasKey = typeof scope.key !== 'undefined';
        scope.getConstructorName = function(){
            return getObjectName(scope.json);
        };

        // Set custom type for null
        if (scope.json === null){
            scope.type = 'null';
        }

        // Set custom type for null
        if (scope.json === undefined){
            scope.type = 'undefined';
        }

        if (scope.type === 'string'){

            // Add custom type for date
            if((new Date(scope.json)).toString() !== 'Invalid Date') {
                scope.isDate = true;
            }

            // Add custom type for URLs
            if (scope.json.indexOf('http') === 0) {
                scope.isUrl = true;
            }
        }

        scope.isEmptyObject = function () {
            return scope.getKeys() && !scope.getKeys().length &&
                scope.isOpen && !scope.isArray();
        };

        if (scope.key) {
            var path = scope.path;

            if (Array.isArray(parentJson)) {
                scope.path =  path + '[' + scope.key+']';
            } else {
                scope.path =  (path ? path + '.' : '') + scope.key;
            }
        }

        // If 'open' attribute is present
        scope.isOpen = !!scope.open;
        scope.toggleOpen = function (event) {
            if (event.target.className.indexOf('toggler') === -1 && scope.actionFn()) {
                scope.actionFn()(scope.path);
            }
            scope.isOpen = !scope.isOpen;
        };
        scope.childrenOpen = function () {
            if (scope.open > 1){
                return scope.open - 1;
            }
            return 0;
        };

        scope.openLink = function (isUrl) {
            if(isUrl) {
                window.location.href = scope.json;
            }
        };

        scope.parseValue = function (value){
            if (scope.type === 'null') {
                return 'null';
            }
            if (scope.type === 'undefined') {
                return 'undefined';
            }
            if (scope.type === 'string') {
                value = '"' + escapeString(value) + '"';
            }
            if (scope.type === 'function'){

                // Remove content of the function
                return scope.json.toString()
                .replace(/\n/g, '')
                .replace(/\{.+?\}/, '') + '{ ... }';

            }
            return value;
        };
    }

    return {
        templateUrl: 'json-formatter.html',
        restrict: 'E',
        replace: true,
        scope: {
            actionFn: '&',
            path: '=',
            json: '=',
            key: '=',
            open: '='
        },
        compile: function(element) {
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            return RecursionHelper.compile(element, link);
        }
    };
}]);

var app = angular.module('form-example1', ['validation']);

var INTEGER_REGEXP = /^\-?\d+$/;

app.controller("Controller", function ($scope, RemoteValidations) {
    $scope.disposableEmail = RemoteValidations.disposableMail;
    $scope.duplicateEmail = RemoteValidations.duplicateMail;
});
app.factory('RemoteValidations', function ($timeout) {
    return {
        disposableMail: function (email) {
            if (!email) return true;
            return email.indexOf('@mailinator.com') >= 0 ? false : true;
        },
        duplicateMail: function (email) {
            return $timeout(function () {
                return ['mail1@abc.com', 'mail2@abc.com', 'mail3@abc.com'].indexOf(email) >= 0 ? true : false;
            }, 2000);
        }
    };
});
angular.module('validation', [])
    .directive('customValidator', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var validateFunctionNames = attr["validateFunctions"].split(",");
            ngModelCtrl.$parsers.push(function (value) {
                var hasErrors = false;
                angular.forEach(validateFunctionNames, function (functionName) {
                    if (!scope[functionName]) {
                        console.log('There is no function with' + functionName + ' available on the scope. Please make sure the function exists on current scope or its parent.');
                    } else {
                        var result = scope[functionName](value);
                        if (result === false) {
                            ngModelCtrl.$setValidity(attr.customValidator, false);
                            hasErrors = true;
                        }
                    }
                });
                return hasErrors ? undefined : value;
            });
        }
    };
}])
    .directive('customRemoteValidator', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var validateFunctionNames = attr["validateFunctions"].split(",");
            ngModelCtrl.$parsers.push(function (value) {
                angular.forEach(validateFunctionNames, function (functionName) {
                    if (!scope[functionName]) {
                        console.log('There is no function with' + functionName + ' available on the scope. Please make sure the function exists on current scope or its parent.');
                    } else {
                        var result = scope[functionName](value);
                        if (result.then) {
                            result.then(function (data) { //For promise type result object
                                ngModelCtrl.$setValidity(attr.customValidator, data);
                            }, function (error) {
                                ngModelCtrl.$setValidity(attr.customValidator, false);
                            });
                        }
                    }
                });
                return value;
            });
        }
    };
}])
    .directive('validationMessages', function () {
    return {
        scope: {
            modelController: '='
        },
        restrict: 'EA',
        link: function (scope, elm, attrs) {
            if (!scope.modelController) {
                console.log('Requires a html attribute data-model-controller. This should point to the input field model controller.');
            }
            scope.$watch('modelController.$error', function (newValue) {
                if (newValue) {
                    scope.errorMessages = [];
                    angular.forEach(newValue, function (value, key) {
                        if (value && attrs[key + 'Error']) {
                            scope.errorMessages.push(attrs[key + 'Error']);
                        }
                    });
                }
            }, true);
        },
        template: '<div><small class="error" ng-repeat="message in errorMessages" ng-show= "!modelController.$pristine && $first" class="warning">{{message}}</small></div>'
    }
})
    .directive('ngUpdateOnBlur', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: '100',
        link: function (scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;

            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function () {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(elm.val());
                });
            });
        }
    };
});
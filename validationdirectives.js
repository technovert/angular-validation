angular.module('validation',[])
  .directive('customValidator', [function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: { validateFunction: '&' },
            link: function (scope, elm, attr, ngModelCtrl) {
                ngModelCtrl.$parsers.push(function (value) {
                    var result = scope.validateFunction({ 'value': value });
                    if (result || result === false) {
                        if (result.then) {
                            result.then(function (data) {           //For promise type result object
                                ngModelCtrl.$setValidity(attr.appcrestCustomValidator, data);
                            }, function (error) {
                                ngModelCtrl.$setValidity(attr.appcrestCustomValidator, false);
                            });
                        }
                        else {
                            ngModelCtrl.$setValidity(attr.appcrestCustomValidator, result);
                            return result ? value : undefined;      //For boolean result return based on boolean value
                        }
                    }
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
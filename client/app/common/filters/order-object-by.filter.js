(function () {
  'use strict';
  angular.module('app').filter('orderObjectBy', orderObjectBy);

  function orderObjectBy() {
    return function (input, attribute) {
      if (!angular.isObject(input)) return input;

      var array = [];
      for (var objectKey in input) {
        array.push(input[objectKey]);
      }

      array.sort(function (a, b) {
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
      });
      return array;
    };
  }
})();
(function () {
  'use strict';
  angular
    .module('app')
    .directive('fgLine', fgLine);

  function fgLine() {
    var directive = {
      restrict: 'C',
      link: linkFunc,
    };

    return directive;

    function linkFunc(scope, element) {
      var input = element.children().first();
      var isFloatLabel = element.parent().hasClass('fg-float');
      input.focus(function () {
        element.addClass('fg-toggled');
      });

      input.blur(function () {
        if (!isFloatLabel || (isFloatLabel && input.val().length === 0)) {
          element.removeClass('fg-toggled');
        }
      });
    }
  }
})();
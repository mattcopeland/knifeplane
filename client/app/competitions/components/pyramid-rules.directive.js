(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmPyramidRules', wpmPyramidRules);

  function wpmPyramidRules() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '=',

      },
      templateUrl: 'competitions/components/pyramid-rules.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc() {
    
    activate();

    function activate() {}
  }
})();
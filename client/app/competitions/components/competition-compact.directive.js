(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmCompetitionCompact', wpmCompetitionCompact);

  function wpmCompetitionCompact() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '=',

      },
      templateUrl: 'competitions/components/competition-compact.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc() {

    activate();

    function activate() {}
  }
})();
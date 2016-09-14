(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpChalleneges', kpChalleneges);

  function kpChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@'
      },
      templateUrl: '/common/components/challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(challengesService) {
    var vm = this;
    vm.challenges = [];

    activate();

    function activate() {
      challengesService.getByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = challenges.data;
      });
    }
  }
})();
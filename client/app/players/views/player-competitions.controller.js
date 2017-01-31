(function () {
  'use strict';
  angular.module('app').controller('PlayerCompetitionsCtrl', PlayerCompetitionsCtrl);

  function PlayerCompetitionsCtrl($state, $stateParams, competitionsService, notifyService) {
    var vm = this;
    vm.userId = null;
    vm.pyramids = [];
    vm.versus = [];

    activate();

    function activate() {
      if ($stateParams.userId) {
        vm.userId = $stateParams.userId;
        getCompetitions();
      } else {
        $state.go('home');
      }
    }

    function getCompetitions() {
      competitionsService.getCompetitionsForUser(vm.userId).then(function (competitions) {
        if (competitions.data) {
          vm.pyramids = _.filter(competitions.data, { 'type': 'pyramid' });
          vm.versus = _.filter(competitions.data, { 'type': 'versus' });
        } else {
          notifyService.info('This player is not involved in any competitions');
        }
      });
    }
  }
})();
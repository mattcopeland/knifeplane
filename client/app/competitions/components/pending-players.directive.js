(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmPendingPlayers', wpmPendingPlayers);

  function wpmPendingPlayers() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '='
      },
      templateUrl: '/competitions/components/pending-players.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(competitionsService) {
    var vm = this;
    vm.pendingPlayers = [];
    vm.approvePendingPlayer = approvePendingPlayer;
    vm.denyPendingPlayer = denyPendingPlayer;

    activate();

    function activate() {}

    function approvePendingPlayer(player) {
      player.position = vm.competition.players.length + 1;
      competitionsService.approvePendingPlayer(vm.competition._id, player);
    }

    function denyPendingPlayer(player) {
      competitionsService.denyPendingPlayer(vm.competition._id, player);
    }
  }
})();
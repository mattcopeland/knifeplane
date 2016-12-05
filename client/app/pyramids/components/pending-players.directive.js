(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpPendingPlayers', kpPendingPlayers);

  function kpPendingPlayers() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        pyramid: '='
      },
      templateUrl: '/pyramids/components/pending-players.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc(pyramidsService) {
    var vm = this;
    vm.pendingPlayers = [];
    vm.approvePendingPlayer = approvePendingPlayer;
    vm.denyPendingPlayer = denyPendingPlayer;

    activate();

    function activate() {}

    function approvePendingPlayer(player) {
      player.position = vm.pyramid.players.length + 1;
      pyramidsService.approvePendingPlayer(vm.pyramid._id, player);
    }

    function denyPendingPlayer(player) {
      pyramidsService.denyPendingPlayer(vm.pyramid._id, player);
    }
  }
})();
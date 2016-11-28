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
        competitionId: '@'
      },
      templateUrl: '/pyramids/components/pending-players.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, pyramidsService) {
    var vm = this;
    vm.pyramid = {};
    vm.pendingPlayers = [];
    vm.approvePendingPlayer = approvePendingPlayer;
    vm.denyPendingPlayer = denyPendingPlayer;

    activate();

    function activate() {
      getPendingPlayers();
    }

    function getPendingPlayers() {
      vm.pendingPlayers = [];
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        if (pyramid.data && pyramid.data.pendingPlayers.length > 0) {
          vm.pendingPlayers = pyramid.data.pendingPlayers;
        }
      });
    }

    function approvePendingPlayer(player) {
      player.position = vm.pyramid.players.length + 1;
      pyramidsService.approvePendingPlayer(vm.competitionId, player).then(getPendingPlayers);
    }

    function denyPendingPlayer(player) {
      pyramidsService.denyPendingPlayer(vm.competitionId, player).then(getPendingPlayers);
    }
  }
})();
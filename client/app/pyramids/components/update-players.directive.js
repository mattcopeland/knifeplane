(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpUpdatePlayers', kpUpdatePlayers);

  function kpUpdatePlayers() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        pyramid: '='
      },
      templateUrl: '/pyramids/components/update-players.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($filter, pyramidsService, challengesService) {
    var removedPlayers = [];
    var vm = this;
    vm.updatePyramid = updatePyramid;
    vm.cancelUpdate = cancelUpdate;
    vm.reorderPlayers = reorderPlayers;
    vm.removePlayer = removePlayer;

    activate();

    function activate() {}

    // Perform the updates that were requsted
    function updatePyramid() {
      _.forEach(removedPlayers, function(player) {
        challengesService.deleteActiveChallengeByCompetitionByPlayer(vm.pyramid._id, player._id);
      });
      pyramidsService.updatePyramid(vm.pyramid);   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      pyramidsService.getPyramid(vm.pyramid._id).then(function (pyramid) {
        pyramid.data.players = $filter('orderBy')(pyramid.data.players, 'position');
        vm.pyramid = pyramid.data;
      });
    }

    // Reorder the players based on the drag-drop
    function reorderPlayers() {
      var i = 1;
      _.forEach(vm.pyramid.players, function (player) {
        player.position = i;
        ++i;
      });
    }

    // Queue up the players to be removed and remove them from the display
    function removePlayer(player, playerIndex) {
      removedPlayers.push(player);
      vm.pyramid.players.splice(playerIndex, 1);
      reorderPlayers();
    }
  }
})();
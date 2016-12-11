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
  function ctrlFunc($scope, $filter, pyramidsService, challengesService, userService) {
    var removedPlayers = [];
    var vm = this;
    vm.availablePlayers = [];
    vm.updatePyramid = updatePyramid;
    vm.cancelUpdate = cancelUpdate;
    vm.reorderPlayers = reorderPlayers;
    vm.removePlayer = removePlayer;
    vm.addPlayer = addPlayer;
    vm.disableSubmit = true;

    activate();

    function activate() {
      $scope.$watch('vm.pyramid', function () {
        if (vm.pyramid) {
          getAvailablePlayers();
        }
      });
    }

    function getAvailablePlayers() {
      userService.getAllUsers().then(function (users) {
        _.forEach(vm.pyramid.players, function (pyramidPlayer) {
          _.remove(users.data, function (availablePlayer){
            return pyramidPlayer._id === availablePlayer._id;
          });
        });
        vm.availablePlayers = users.data;
      });
    }

    // Perform the updates that were requsted
    function updatePyramid() {
      _.forEach(removedPlayers, function(player) {
        challengesService.deleteActiveChallengeByCompetitionByPlayer(vm.pyramid._id, player._id);
      });
      pyramidsService.updatePyramid(vm.pyramid).then(function () {
        vm.disableSubmit = true;
      });   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      pyramidsService.getPyramid(vm.pyramid._id).then(function (pyramid) {
        pyramid.data.players = $filter('orderBy')(pyramid.data.players, 'position');
        vm.pyramid = pyramid.data;
        vm.disableSubmit = true;
      });
      getAvailablePlayers();
    }

    // Reorder the players based on the drag-drop
    function reorderPlayers() {
      var i = 1;
      _.forEach(vm.pyramid.players, function (player) {
        player.position = i;
        ++i;
      });
      vm.disableSubmit = false;
    }

    /**
     * Removes a player from the pyramid
     * Queue up the players to be removed and remove them from the display
     * @param  {object} player
     */
    function removePlayer(player) {
      removedPlayers.push(player);
      vm.availablePlayers.push(_.remove(vm.pyramid.players, {_id: player._id})[0]);
      reorderPlayers();
    }

    /**
     * Adds a player to the new pyramid
     * @param  {object} player
     */
    function addPlayer(player) {
      player.position = vm.pyramid.players.length + 1;
      vm.pyramid.players.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
      vm.disableSubmit = false;
    }
  }
})();
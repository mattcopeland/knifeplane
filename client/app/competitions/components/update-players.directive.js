(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmUpdatePlayers', wpmUpdatePlayers);

  function wpmUpdatePlayers() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '='
      },
      templateUrl: 'competitions/components/update-players.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, competitionsService, challengesService, userService, notifyService) {
    var removedPlayers = [];
    var originalAvailablePlayers = [];
    var maxLevels = 7;
    var maxPlayers = null;
    var vm = this;
    vm.availablePlayers = [];
    vm.addedPlayers = [];
    vm.updateCompetition = updateCompetition;
    vm.cancelUpdate = cancelUpdate;
    vm.reorderPlayers = reorderPlayers;
    vm.removePlayer = removePlayer;
    vm.addPlayer = addPlayer;
    vm.disableSubmit = true;

    activate();

    function activate() {
      // Determine the maximum number of players based on the maximum number of levels
      for (var i = maxLevels; i > 0; --i) {
        maxPlayers += i;
      }
      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          vm.addedPlayers = _.cloneDeep(vm.competition.players);
          vm.disableSubmit = true;
          getAvailablePlayers();
        }
      });
    }

    function getAvailablePlayers() {
      vm.availablePlayers = [];
      removedPlayers = [];
      userService.getVerifiedUsers().then(function (users) {
        _.forEach(vm.competition.players, function (competitionPlayer) {
          _.remove(users.data, function (availablePlayer){
            return competitionPlayer._id === availablePlayer._id;
          });
        });
        // Only use certain properties of the user for the player record
        _.forEach(users.data, function (availablePlayer) {
          vm.availablePlayers.push({
            firstName: availablePlayer.firstName,
            lastName: availablePlayer.lastName,
            displayName: availablePlayer.displayName,
            email: availablePlayer.username,
            _id: availablePlayer._id
          });
        });
        
        originalAvailablePlayers = _.cloneDeep(vm.availablePlayers);
      });
    }

    // Perform the updates that were requsted
    function updateCompetition() {
      if (vm.competition.type === 'versus' && vm.addedPlayers.length % 2 > 0) {
        notifyService.error('A Versus competition must have an even number of players');
      } else if (vm.addedPlayers.length > maxPlayers) {
        notifyService.error('A competition can have a maximum of ' + maxPlayers + ' players');
      } else {
        _.forEach(removedPlayers, function(player) {
          challengesService.deleteActiveChallengeByCompetitionByPlayer(vm.competition._id, player._id);
        });
        vm.competition.players = vm.addedPlayers;
        competitionsService.updateCompetition(vm.competition).then(function () {
          vm.disableSubmit = true;
        });
      }
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      removedPlayers = [];
      vm.addedPlayers = _.cloneDeep(vm.competition.players);
      vm.availablePlayers = _.cloneDeep(originalAvailablePlayers);
    }

    // Reorder the players based on the drag-drop
    function reorderPlayers() {
      if (vm.competition.type === 'versus') {
        reorderVersusPlayers();
      } else if (vm.competition.type === 'pyramid') {
        reorderPyramidPlayers();
      }
      vm.disableSubmit = false;
    }

    /**
     * Reorder the players based on the drag-drop
     */
    function reorderPyramidPlayers() {
      var i = 1;
      _.forEach(vm.addedPlayers, function (player) {
        player.position = i;
        ++i;
      });
    }

    function reorderVersusPlayers() {
      // Set all players to team 2
      _.forEach(vm.addedPlayers, function (player) {
        player.position = 2;
      });
      // Set the first half of the players to team 1
      for (var i = 0; i < (vm.addedPlayers.length / 2); i++) {
        vm.addedPlayers[i].position = 1;
      }
    }

    /**
     * Removes a player from the competition
     * Queue up the players to be removed and remove them from the display
     * @param  {object} player
     */
    function removePlayer(player) {
      removedPlayers.push(player);
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
      reorderPlayers();
    }

    /**
     * Adds a player to the new competition
     * @param  {object} player
     */
    function addPlayer(player) {
      vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
      reorderPlayers();
      vm.disableSubmit = false;
    }
  }
})();
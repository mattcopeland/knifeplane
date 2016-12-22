/**
 * Creates a competition
 */
(function () {
  'use strict';
  angular.module('app').controller('CreateCompetitionCtrl', CreateCompetitionCtrl);

  function CreateCompetitionCtrl($state, userService, competitionsService, identityService, notifyService) {
    var breakPoints = [];
    var maxLevels = 7;
    var maxPlayers = null;
    var vm = this;
    vm.newCompetition = {
      players: [],
      restrictJoins: false
    };
    vm.availablePlayers = [];
    vm.addedPlayers = [];
    vm.createCompetition = createCompetition;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.reorderPlayers = reorderPlayers;
    vm.newCompetition.forfeitDays = 1;
    vm.competitionTypes = ['pyramid', 'versus'];

    activate();
    
    /**
     * Runs on controller instantiation
     */
    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });

      // Determine the maximum number of players based on the maximum number of levels
      for (var i = maxLevels; i > 0; --i) {
        maxPlayers += i;
      }

      // Create break points array
      for (i = 0; i < maxLevels; i++) {
        breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }
    }

    /**
     * Adds a player to the new competition
     * Checks to make sure you are not adding too many players
     * @param  {object} player
     */
    function addPlayer(player) {
      vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
      reorderPlayers();
    }

    /**
     * Removes a previuosly added player from the competition
     * @param  {object} player
     */
    function removePlayer(player) {
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
      reorderPlayers();
    }

    /**
     * Make changes based on the competition type
     */
    function reorderPlayers() {
      if (vm.newCompetition.type === 'versus') {
        reorderVersusPlayers();
      } else if (vm.newCompetition.type === 'pyramid') {
        reorderPyramidPlayers();
      }
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
     * Create the competition
     * @param  {object} competition
     */
    function createCompetition(competition) {
      if (competition.type === 'versus' && vm.addedPlayers.length % 2 > 0) {
        notifyService.error('A Versus competition must have an even number of players');
      } else if (vm.addedPlayers.length > maxPlayers) {
        notifyService.error('A competition can have a maximum of ' + maxPlayers + ' players');
      } else {
        angular.forEach(vm.addedPlayers, function (player) {
          var addPlayer = {
            _id: player._id,
            email: player.username,
            firstName: player.firstName,
            lastName: player.lastName,
            position: player.position
          };
          competition.players.push(addPlayer);
        });
        competition.admins = [{
          _id: identityService.currentUser._id,
          email: identityService.currentUser.username,
          firstName: identityService.currentUser.firstName,
          lastName: identityService.currentUser.lastName,
          primary: true
        }];

        // Figure out the number of levels based on the number of players
        for (var i = 0; i < breakPoints.length; i++) {
          if (competition.players.length < breakPoints[i]) {
            competition.levels = i;
            break;
          }
        }

        competitionsService.createCompetition(competition).then(function (newCompetition) {
          $state.go('competitions.view', {
            competitionId: newCompetition.data._id
          });
        });
      }
    }
  }
})();
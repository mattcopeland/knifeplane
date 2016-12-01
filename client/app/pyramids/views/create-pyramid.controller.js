/**
 * Creates a pyramid
 */
(function () {
  'use strict';
  angular.module('app').controller('CreatePyramidCtrl', CreatePyramidCtrl);

  function CreatePyramidCtrl($state, userService, pyramidsService, notifyService, identityService) {
    var breakPoints = [];
    var maxLevels = 10;
    var vm = this;
    vm.newPyramid = {
      players: [],
      open: false
    };
    vm.availablePlayers = [];
    vm.addedPlayers = [];
    vm.createPyramid = createPyramid;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.newPyramid.forfeitDays = 1;

    activate();
    
    /**
     * Runs on controller instantiation
     */
    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });

      // Create break points array
      for (var i = 0; i < maxLevels; i++) {
        breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }
    }

    /**
     * Adds a player to the new pyramid
     * Checks to make sure you are not adding too many players
     * @param  {object} player
     */
    function addPlayer(player) {
      vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
    }

    /**
     * Removes a previuosly added player from the pyramid
     * @param  {object} player
     */
    function removePlayer(player) {
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
    }

    // Used to keep track of position on the pyramid based on when the player was added
    var position = 0;

    /**
     * Create the pyramid
     * @param  {object} pyramid
     */
    function createPyramid(pyramid) {
      angular.forEach(vm.addedPlayers, function (player) {
        position += 1;
        var addPlayer = {
          position: position,
          _id: player._id,
          email: player.username,
          firstName: player.firstName,
          lastName: player.lastName,
          nickname: player.nickname
        };
        pyramid.players.push(addPlayer);
      });
      pyramid.owners = [{
        _id: identityService.currentUser._id,
        email: identityService.currentUser.username
      }];

      // Figure out the number of levels based on the number of players
      for (var i = 0; i < breakPoints.length; i++) {
        if (pyramid.players.length < breakPoints[i]) {
          pyramid.levels = i;
          break;
        }
      }

      pyramidsService.createPyramid(pyramid).then(function (newPyramid) {
        $state.go('pyramids.view', {
          competitionId: newPyramid.data._id
        });
      });
    }
  }
})();
/**
 * Creates a pyramid
 */
(function () {
  'use strict';
  angular.module('app').controller('CreatePyramidCtrl', CreatePyramidCtrl);

  function CreatePyramidCtrl($scope, $state, userService, pyramidsService, notifyService) {
    var vm = this;
    vm.newPyramid = {
      players: []
    };
    vm.availablePlayers = [];
    vm.addedPlayers = [];
    vm.createPyramid = createPyramid;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.allowedPlayers = 10;
    vm.newPyramid.levels = 4;
    vm.newPyramid.forfeitDays = 1;

    activate();
    
    /**
     * Runs on controller instantiation
     */
    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });
    }

    /**
     * Adds a player to the new pyramid
     * Checks to make sure you are not adding too many players
     * @param  {object} player
     */
    function addPlayer(player) {
      if(vm.addedPlayers.length < vm.allowedPlayers) {
        vm.addedPlayerAdded = true;
        vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
      } else {
        notifyService.error('All spots have been filled.<br />If you want to add more people please increase the levels.');
      }
    }

    /**
     * Removes a previuosly added player from the pyramid
     * @param  {object} player
     */
    function removePlayer(player) {
      vm.addedPlayerAdded = false;
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
    }

    /**
     * Updates the number of allowed players for the pyramid
     * based on the number of levels chosen
     * Removes extra players and makes them available again
     * @param  {number} levels
     */
    function updateAllowedPlayers(levels) {
      vm.allowedPlayers = 0;
      for (var i = levels; i > 0; i--) {
        vm.allowedPlayers += i;
      }
      if (vm.addedPlayers.length > vm.allowedPlayers) {
        var removedPlayers = vm.addedPlayers.splice(vm.allowedPlayers);
        vm.availablePlayers = vm.availablePlayers.concat(removedPlayers);
        notifyService.warning('Players were removed becasue there are not enough spots on the pyramid.')
      }
    }

    // Wacth for changes to the pyramid levels model and update the number of allowed players
    $scope.$watch('vm.newPyramid.levels', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        updateAllowedPlayers(newVal);
      }
    });

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
          firstName: player.firstName,
          lastName: player.lastName,
          nickname: player.nickname
        };
        vm.newPyramid.players.push(addPlayer);
      });
      pyramidsService.createPyramid(pyramid).then(function (newPyramid) {
        $state.go('pyramids.view', {
          competitionId: newPyramid.data._id
        });
      });
    }
  }
})();
(function () {
  'use strict';
  angular.module('app').controller('CreatePyramidCtrl', CreatePyramidCtrl);

  function CreatePyramidCtrl($state, userService, pyramidsService) {
    var vm = this;
    vm.newPyramid = {
      players: []
    };
    vm.availablePlayers = [];
    vm.addedPlayers = [];
    vm.createPyramid = createPyramid;
    vm.addPlayer = addPlayer;
    vm.removePlayer = removePlayer;
    vm.newPyramid.levels = 4;
    vm.newPyramid.forfeitHours = 24;

    activate();

    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });
    }

    function addPlayer(player) {
      vm.availablePlayerAdded = false;
      vm.addedPlayerAdded = true;
      vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
    }

    function removePlayer(player) {
      vm.availablePlayerAdded = true;
      vm.addedPlayerAdded = false;
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
    }

    var position = 0;

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
          pyramidId: newPyramid.data._id
        });
      });
    }
  }
})();
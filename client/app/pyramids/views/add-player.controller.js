(function () {
  'use strict';
  angular.module('app').controller('AddPlayerCtrl', AddPlayerCtrl);

  function AddPlayerCtrl($state, $stateParams, userService, pyramidsService) {
    var vm = this;
    vm.availablePlayers = [];
    vm.addPlayerToPyramid = addPlayerToPyramid;
    vm.createPyramid = createPyramid;

    activate();

    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });
    }

    var position = 0;

    function addPlayerToPyramid(player) {
      // Add the selected player to the players array
      position += 1;
      var addPlayer = {
        position: position,
        _id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        nickname: player.nickname
      };
      vm.newPyramid.players.push(addPlayer);
      // Remove the selected player from the available players
      _.remove(vm.availablePlayers, {
        _id: player._id
      });
    }

    function createPyramid(pyramid) {
      pyramidsService.createPyramid(pyramid).then(function (newPyramid) {
        $state.go('pyramids.view', {
          pyramidId: newPyramid.data._id
        });
      });
    }
  }
})();
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
    vm.newPyramid.levels = 4;

    activate();

    function activate() {
      userService.getAllUsers().then(function (users) {
        vm.availablePlayers = users.data;
      });
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
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
    var originalAvailablePlayers = [];
    var vm = this;
    vm.availablePlayers = [];
    vm.addedPlayers = [];
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
          vm.addedPlayers = _.cloneDeep(vm.pyramid.players);
          vm.disableSubmit = true;
          getAvailablePlayers();
        }
      });
    }

    function getAvailablePlayers() {
      vm.availablePlayers = [];
      userService.getAllUsers().then(function (users) {
        _.forEach(vm.pyramid.players, function (pyramidPlayer) {
          _.remove(users.data, function (availablePlayer){
            return pyramidPlayer._id === availablePlayer._id;
          });
        });
        // Only use certain properties of the user for the player record
        _.forEach(users.data, function (availablePlayer) {
          vm.availablePlayers.push({
            firstName: availablePlayer.firstName,
            lastName: availablePlayer.lastName,
            email: availablePlayer.username,
            _id: availablePlayer._id
          });
        });
        
        originalAvailablePlayers = _.cloneDeep(vm.availablePlayers);
      });
    }

    // Perform the updates that were requsted
    function updatePyramid() {
      _.forEach(removedPlayers, function(player) {
        challengesService.deleteActiveChallengeByCompetitionByPlayer(vm.pyramid._id, player._id);
      });
      vm.pyramid.players = vm.addedPlayers;
      pyramidsService.updatePyramid(vm.pyramid).then(function () {
        vm.disableSubmit = true;
      });   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      vm.addedPlayers = _.cloneDeep(vm.pyramid.players);
      vm.availablePlayers = _.cloneDeep(originalAvailablePlayers);
    }

    // Reorder the players based on the drag-drop
    function reorderPlayers() {
      var i = 1;
      _.forEach(vm.addedPlayers, function (player) {
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
      vm.availablePlayers.push(_.remove(vm.addedPlayers, {_id: player._id})[0]);
      reorderPlayers();
    }

    /**
     * Adds a player to the new pyramid
     * @param  {object} player
     */
    function addPlayer(player) {
      player.position = vm.addedPlayers.length + 1;
      vm.addedPlayers.push(_.remove(vm.availablePlayers, {_id: player._id})[0]);
      vm.disableSubmit = false;
    }
  }
})();
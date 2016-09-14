(function () {
  'use strict';
  angular.module('app').directive('_kpPyramid', _kpPyramid);

  function _kpPyramid() {
    var directive = {
      restrict: 'E',
      templateUrl: '/pyramids/components/pyramid.html',
      replace: true,
      scope: {
        pyramidId: '@'
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  ctrlFunc.$inject = ['$scope', 'pyramidsService', '$filter', 'Notification', 'identityService'];

  function ctrlFunc($scope, pyramidsService, $filter, Notification, identityService) {
    /*jshint validthis: true */
    var vm = this;
    vm.pyramid = {};
    vm.breakPoints = [];
    vm.numberOfBlocks = 0;
    vm.level = 0;
    vm.updatePyramid = updatePyramid;
    vm.isPlayerOnPyramid = false;

    var player1 = {};
    var player2 = {};
    var numberOfActualPlayers = 0;

    activate();

    function activate() {
      pyramidsService.getPyramid(vm.pyramidId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        numberOfActualPlayers = vm.pyramid.players.length;

        if (_.find(vm.pyramid.players, ['_id', identityService.currentUser._id])) {
          vm.isPlayerOnPyramid = true;
        }

        orderPlayers();
        createBreakPoints();
        calculatePyramidBlocks();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
        if (vm.isPlayerOnPyramid) {
          assignPlayerOne();
        }
      });
    }

    function updatePyramid(player) {
      if (identityService.isAuthenticated() && vm.isPlayerOnPyramid) {
        // Allow admins to select the first player
        if (_.isEmpty(player1) && player.position !== 99 && identityService.isAuthorized('admin')) {
          player1 = player;
          player1.class = 'active';
          // Allow admins to deselect the first player
        } else if (player1 === player && identityService.isAuthorized('admin')) {
          player1.class = '';
          player1 = {};
          // Only allow swapping with (real) players 1 level above or below
        } else if (player.level === player1.level || player.level < player1.level - 1 || player.level > player1.level + 1 || player.position === 99) {
          Notification.error('Sorry, thats not allowed!');
          // Do the swapping and save to the database
          // Then reset to do it all over again
        } else {
          var player1OldPosition = player1.position;
          var player1OldLevel = player1.level;
          player2 = player;

          player1.position = player.position;
          player1.level = player.level;

          player2.position = player1OldPosition;
          player2.level = player1OldLevel;

          pyramidsService.swapPositions(vm.pyramidId, player1, player2);

          player1.class = '';
          player1 = {};
          player2 = {};
        }
      } else if (identityService.isAuthenticated() && !vm.isPlayerOnPyramid && player.position === 99) {
        addPlayerToPyramid();
      } else {
        Notification.error('You can not update this pyramid.<br>You must join the pyramid first.');
      }
    }

    function addPlayerToPyramid() {
      var newPlayer = {
        position: numberOfActualPlayers + 1,
        _id: identityService.currentUser._id,
        firstName: identityService.currentUser.firstName,
        lastName: identityService.currentUser.lastName,
        nickname: identityService.currentUser.nickname
      };
      pyramidsService.addPlayerToPyramid(vm.pyramidId, newPlayer).then(function (response) {
        vm.isPlayerOnPyramid = true;
        refreshPyramid();
      });
    }

    // Order the players by the position property of the players array in the pyramid object
    function orderPlayers() {
      vm.pyramid.players = $filter('orderBy')(vm.pyramid.players, 'position');
    }

    // Figure out where to start each new row on the pyramid
    function createBreakPoints() {
      vm.breakPoints = [];
      for (var i = 0; i < vm.pyramid.levels; i++) {
        vm.breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }
    }

    // How many total blocks in this pyramid
    function calculatePyramidBlocks() {
      vm.numberOfBlocks = 0;
      for (var i = vm.pyramid.levels; i > 0; i--) {
        vm.numberOfBlocks += i;
      }
    }

    // Fill out the remaining blocks of the pyramid with empty blocks
    function fillInEmptyBlocks() {
      for (var i = vm.pyramid.players.length; i < vm.numberOfBlocks; i++) {
        vm.pyramid.players.push({
          firstName: 'Empty',
          lastName: 'Spot',
          position: 99,
          class: 'empty'
        });
      }
    }

    // Give each player a level property based on the break points
    function assignLevelsToPlayers() {
      vm.level = 0;
      for (var i = 0; i < vm.pyramid.players.length; i++) {
        if (vm.breakPoints.indexOf(i + 1) > -1) {
          vm.level += 1;
        }
        vm.pyramid.players[i].level = vm.level;
      }
    }

    // If the current user is a player on this pyramid make them player 1
    function assignPlayerOne() {
      if (!identityService.isAuthorized('admin') && identityService.isAuthenticated() && vm.isPlayerOnPyramid) {
        player1 = _.find(vm.pyramid.players, ['_id', identityService.currentUser._id]);
        player1.class = 'active';
      }
    }

    function refreshPyramid() {
      pyramidsService.getPyramid(vm.pyramidId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        orderPlayers();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
        assignPlayerOne();
      });
    }

    $scope.$on('ws:match_results', function (_, result) {
      Notification.info(result);
      refreshPyramid();
    });
  }
})();
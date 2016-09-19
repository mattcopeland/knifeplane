(function () {
  'use strict';
  angular
    .module('app')
    .directive('kpPyramid', kpPyramid);

  function kpPyramid() {
    var directive = {
      restrict: 'A',
      templateUrl: '/pyramids/components/pyramid.html',
      replace: true,
      scope: {
        competitionId: '@'
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, pyramidsService, $filter, Notification, identityService, challengesService) {
    var vm = this;
    vm.pyramid = {};
    vm.breakPoints = [];
    vm.numberOfBlocks = 0;
    vm.level = 0;
    vm.isPlayerOnPyramid = false;
    vm.hasActiveChallenge = false;
    vm.startChallenge = startChallenge;
    vm.createChallenge = createChallenge;
    vm.currentUserPlayer = {};

    activate();

    function activate() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;

        // Figure out if the current user is on this pyramid
        if (_.find(vm.pyramid.players, ['_id', identityService.currentUser._id])) {
          vm.isPlayerOnPyramid = true;
        }

        orderPlayers();
        getPlayersStatus();
        createBreakPoints();
        calculatePyramidBlocks();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
        if (vm.isPlayerOnPyramid) {
          findCurrentUserOnPyramid();
        }
      });
    }

    // Order the players by the position property of the players array in the pyramid object
    function orderPlayers() {
      vm.pyramid.players = $filter('orderBy')(vm.pyramid.players, 'position');
    }

    // Figure out if each player is already challenged and set some stuff
    function getPlayersStatus() {
      _.forEach(vm.pyramid.players, function (player) {
        challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
          if (challenge.data) {
            player.challenge = {
              expires: (moment().diff(moment(challenge.data.created).add(challenge.data.timeLimit, 'h'),'s')) * -1
            };
            if (player._id !== vm.currentUserPlayer._id) {
              player.class = 'unavailable';
            }
          }
        });
      });
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
    // This will be used to determine who other players can challenge
    function assignLevelsToPlayers() {
      vm.level = 0;
      for (var i = 0; i < vm.pyramid.players.length; i++) {
        if (vm.breakPoints.indexOf(i + 1) > -1) {
          vm.level += 1;
        }
        vm.pyramid.players[i].level = vm.level;
      }
    }

    // If the current user is a player on this pyramid add a class to them
    function findCurrentUserOnPyramid() {
      if (identityService.isAuthenticated() && vm.isPlayerOnPyramid) {
        vm.currentUserPlayer = _.find(vm.pyramid.players, ['_id', identityService.currentUser._id]);
        vm.currentUserPlayer.class = 'current-user';

        challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, identityService.currentUser._id).then(function (response) {
          vm.hasActiveChallenge = response.data.length > 0 ? true : false;
        });
      }
    }

    function startChallenge() {
      var levelAbove = vm.currentUserPlayer.level > 1 ? vm.currentUserPlayer.level - 1 : null;
      _.forEach(vm.pyramid.players, function (player) {
        if (player.level === levelAbove && player.position !== 99 && player.class != 'unavailable') {
          player.class = 'available';
          player.available = true;
        }
      });
    }

    function createChallenge(player) {
      if (!player.available) {
        Notification.error('Sorry, that is not a valid challenge.');
      } else {
        var challenge = {
          competitionId: vm.competitionId,
          complete: false,
          forfeit: false,
          timeLimit: 24,
          challenger: {
            _id: vm.currentUserPlayer._id,
            firstName: vm.currentUserPlayer.firstName,
            lastName: vm.currentUserPlayer.lastName,
            nickname: vm.currentUserPlayer.nickname
          },
          opponent: {
            _id: player._id,
            firstName: player.firstName,
            lastName: player.lastName,
            nickname: player.nickname
          }
        };
        challengesService.createChallenge(challenge);
        refreshPyramid();
      }
    }


    // Refresh the pyramid becasue of an update
    function refreshPyramid() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
        orderPlayers();
        getPlayersStatus();
        fillInEmptyBlocks();
        assignLevelsToPlayers();
        if (vm.isPlayerOnPyramid) {
          findCurrentUserOnPyramid();
        }
      });
    }

    // Watch for websocket event
    $scope.$on('ws:challenge_created', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        Notification.info(challengeDetails.description);
      }
    });
  }
})();
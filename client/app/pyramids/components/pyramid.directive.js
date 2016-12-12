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
        pyramid: '='
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, $state, pyramidsService, $filter, notifyService, identityService, challengesService) {
    var maxLevels = 10;
    var vm = this;
    vm.competitionId = null;
    vm.breakPoints = [];
    vm.levels = [];
    vm.numberOfBlocks = 0;
    vm.currentUserIsOnPyramid = false;
    vm.currentUserIsPending = false;
    vm.currentUserIsOwner = false;
    vm.hasActiveChallenge = false;
    vm.activeChallengeOpponent = null;
    vm.availableChallenges = false;
    vm.createChallenge = createChallenge;
    vm.completeChallenge = completeChallenge;
    vm.challengeExpired = challengeExpired;
    vm.currentUserPlayer = {};
    vm.pyramidMenuToggle = false;
    vm.addCurrentUserToPyramid = addCurrentUserToPyramid;
    vm.confirmRemoveCurrentUserFromPyramid = confirmRemoveCurrentUserFromPyramid;
    vm.playerClick = playerClick;
    vm.numberOfRealPlayers = 0;
    vm.maxPlayers = 0;

    activate();

    function activate() {
      // Determine the maximum number of players based on the maximum number of levels
      for (var i = maxLevels; i > 0; --i) {
        vm.maxPlayers += i;
      }

      $scope.$watch('vm.pyramid', function () {
        if (vm.pyramid) {
          vm.competitionId = vm.pyramid._id;
          orderPlayers();
          getPlayersStatus();
          assignLevelsToPlayers();
          calculatePyramidBlocks();
          fillInEmptyBlocks();
        }
      });
    }

    /**
     * Order the players by the position property of the players array in the pyramid object
     */
    function orderPlayers() {
      vm.pyramid.players = $filter('orderBy')(vm.pyramid.players, 'position');
    }

    /**
     * Figure out if each player is already challenged and set some stuff
     */
    function getPlayersStatus() {
      
      vm.currentUserIsOwner = false;
      vm.currentUserIsPending = false;
      if (identityService.isAuthenticated()) {
        // Check to see if the current user is an owner of this pyramid
        vm.currentUserIsOwner = _.some(vm.pyramid.owners, ['_id', identityService.currentUser._id]);
        // Check to see if the current user has a pending request to join
        vm.currentUserIsPending = _.some(vm.pyramid.pendingPlayers, ['_id', identityService.currentUser._id]);
      }

      vm.currentUserIsOnPyramid = false;
      vm.hasActiveChallenge = false;
      _.forEach(vm.pyramid.players, function (player) {
        // Find the current user if they are on this pyramid and set some properties
        if (identityService.isAuthenticated() && player._id === identityService.currentUser._id) {
          vm.currentUserIsOnPyramid = true;
          player.class = 'current-user';
          vm.currentUserPlayer = player;

          // Check if the current user has an active challenge
          challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
            if (challenge.data) {
              vm.hasActiveChallenge = true;
              vm.activeChallengeOpponent = challenge.data.challenger._id === player._id ? challenge.data.opponent : challenge.data.challenger;
            }
          });
        }
      });

      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenges) {
        _.forEach(challenges.data, function (challenge) {

          var challenger = _.find(vm.pyramid.players, { '_id': challenge.challenger._id });
          challenger.class = 'unavailable';
          challenger.challenge = {
            position: 'challenger'
          };

          var opponent = _.find(vm.pyramid.players, { '_id': challenge.opponent._id });
          opponent.class = 'unavailable';
          opponent.challenge = {
            position: 'opponent'
          };

          // Track when the challenge will expire
          if (challenge.timeLimit !== 0) {
            var timeToExpire = moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd'), 's') * -1;
            // If the challenge has not yet expired display a countdown on the opponent
            if (timeToExpire > 0) {
              opponent.challenge.expires = timeToExpire;
              // If the challenge expired while no one was viewing this pyramid complete the challenge by forfeit
            } else if (timeToExpire <= 0) {
              completeChallenge(null, true, opponent);
            }
          }
        });
        // Now that we know which players are in challenges and which aren't
        // find the available challenges for this user
        findAvailableChallenges();
      });
    }

    /**
     * Figure out where to start each new row on the pyramid
     */
    function createBreakPoints() {
      vm.breakPoints = [];
      for (var i = 0; i < maxLevels; i++) {
        vm.breakPoints.push((((i * (i + 1)) / 2)) + 1);
      }
    }

    // Give each player a level property based on the break points
    // This will be used to determine who other players can challenge
    function assignLevelsToPlayers() {
      var level = 0;
      vm.levels = [];
      createBreakPoints();
      for (var i = 0; i < vm.pyramid.players.length; i++) {
        if (vm.breakPoints.indexOf(i + 1) > -1) {
          level += 1;
          // Set the number of total levels
          vm.levels.push(level);
        }
        // Give each player a level
        vm.pyramid.players[i].level = level;
      }
    }

    // How many total blocks in this pyramid
    function calculatePyramidBlocks() {
      vm.numberOfBlocks = 0;
      for (var i = _.last(vm.levels); i > 0; i--) {
        vm.numberOfBlocks += i;
      }
    }

    // Fill out the remaining blocks of the pyramid with empty blocks
    function fillInEmptyBlocks() {
      vm.numberOfRealPlayers = vm.pyramid.players.length;
      for (var i = vm.pyramid.players.length; i < vm.numberOfBlocks; i++) {
        vm.pyramid.players.push({
          firstName: 'Empty',
          lastName: 'Spot',
          position: 99,
          class: 'empty'
        });
      }
      // We have to give levels to the new empty spots
      assignLevelsToPlayers();
    }

    // Find all the players that are available to be challenged by this user
    function findAvailableChallenges() {
      if (vm.currentUserIsOnPyramid && !vm.hasActiveChallenge) {
        var levelAbove = vm.currentUserPlayer.level > 1 ? vm.currentUserPlayer.level - 1 : null;
        _.forEach(vm.pyramid.players, function (player) {
          if (player.level === levelAbove && player.position !== 99 && player.class !== 'unavailable') {
            vm.availableChallenges = true;
            player.available = true;
            player.class = 'available';
          }
        });
      }
    }

    function createChallenge(player) {
      if (!player.available) {
        notifyService.error('Sorry, that is not a valid challenge.');
      } else {
        vm.hasActiveChallenge = true;
        var challenge = {
          competitionName: vm.pyramid.name,
          competitionId: vm.competitionId,
          complete: false,
          forfeit: false,
          timeLimit: vm.pyramid.forfeitDays,
          challenger: {
            _id: vm.currentUserPlayer._id,
            email: vm.currentUserPlayer.email,
            firstName: vm.currentUserPlayer.firstName,
            lastName: vm.currentUserPlayer.lastName,
            position: vm.currentUserPlayer.position
          },
          opponent: {
            _id: player._id,
            email: player.email,
            firstName: player.firstName,
            lastName: player.lastName,
            position: player.position
          }
        };
        // Create the challenge
        // Websocket event will refresh the pyramid
        challengesService.createChallenge(challenge).then(function () {
          vm.pyramidMenuToggle = false;
        });
      }
    }
    /**
     * Complete a challenge by a user interaction or a forfeit
     * 
     * @param  {boolean} winnerIsCurrentUser
     * @param  {boolean} forfeit
     * @param  {object} forfeitLoser
     */
    function completeChallenge(winnerIsCurrentUser, forfeit, forfeitLoser) {
      var player = forfeitLoser || vm.currentUserPlayer;
      challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
        vm.hasActiveChallenge = false;

        var swapPositions = false;

        // If there is a forfeit
        if (forfeit) {
          challenge.data.forfeit = true;
          if (forfeitLoser.challenge.position === 'opponent') {
            challenge.data.winner = 'challenger';
            swapPositions = true;
          } else {
            challenge.data.winner = 'opponent';
          }
          // Figure out who the winner was to store in the challenge record
        } else if (winnerIsCurrentUser) {
          if (challenge.data.challenger._id === vm.currentUserPlayer._id) {
            challenge.data.winner = 'challenger';
            swapPositions = true;
          } else {
            challenge.data.winner = 'opponent';
          }
        } else {
          if (challenge.data.challenger._id === vm.currentUserPlayer._id) {
            challenge.data.winner = 'opponent';
          } else {
            challenge.data.winner = 'challenger';
            swapPositions = true;
          }
        }

        // Swap positions and then complete the challenge or just complete the challenge
        // Websocket event will refresh the pyramid
        if (swapPositions) {
          pyramidsService.swapPositions(vm.competitionId, challenge.data.opponent, challenge.data.challenger).then(function () {
            challengesService.completeChallenge(challenge.data).then(function () {
              if (removingCurrentUser) {
                removeCurrentUserFromPyramid();
              }
            });
          });
        } else {
          challengesService.completeChallenge(challenge.data).then(function () {
            if (removingCurrentUser) {
              removeCurrentUserFromPyramid();
            }
          });
        }

        vm.pyramidMenuToggle = false;
      });
    }
    /**
     * Calls the complete challnge function with the forfeiting player
     * @param  {object} player
     */
    function challengeExpired(player) {
      completeChallenge(null, true, player);
    }
    /**
     * Adds the current user the pyramid 
     * if they're not already on it and there's space
     */
    function addCurrentUserToPyramid() {
      if (identityService.isAuthenticated()) {
        if (vm.numberOfRealPlayers < vm.maxPlayers) {
          var player = {
            _id: identityService.currentUser._id,
            firstName: identityService.currentUser.firstName,
            lastName: identityService.currentUser.lastName,
            email: identityService.currentUser.username,
            position: vm.numberOfRealPlayers + 1
          };
          if (vm.pyramid.open) {
            swal({
              title: 'Join Competition?',
              text: 'You\'ll be added to the bottom',
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Join',
              cancelButtonText: 'Nevermind',
              closeOnConfirm: false,
              closeOnCancel: true
            }, function () {
              pyramidsService.addPlayerToPyramid(vm.competitionId, player);
              swal('Welcome Aboard!', 'Now start fighting your way to the top', 'success');
            });  
          } else {
            swal({
              title: 'Send Join Request?',
              text: 'This is a closed competition so the owner must approve your request',
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Send Request',
              cancelButtonText: 'Nevermind',
              closeOnConfirm: false,
              closeOnCancel: true
            }, function () {
              pyramidsService.addPlayerToPyramidRequest(vm.pyramid, player).then(function () {
                vm.currentUserIsPending = true;
              });
              swal('Request Sent', 'You will receive an email once the owner processes the request.', 'success');
            });
          }
        } else {
          notifyService.warning('Sorry, this pyramid is full');
        }
      } else {
        notifyService.warning('Please login to join a competition');
        $state.previous = 'pyramids.view';
        $state.prevParams = {'competitionId': vm.competitionId};
        $state.go('login');
      }
    }

    function confirmRemoveCurrentUserFromPyramid() {
      swal({
        title: 'Leave Pyramid?',
        text: 'You will lose your spot and forfeit any active challenges.',
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        confirmButtonClass: 'btn-danger',
        cancelButtonText: 'No, stay',
        closeOnConfirm: false,
        closeOnCancel: true
      }, function () {
        removeCurrentUserFromPyramid();
        swal('OK, you\'r out!', 'You\'ve been removed from the pyramid.', 'success');
      });
    }

    // Use this to enforce order of operations when the player to be removed had an active challenge
    var removingCurrentUser = false;

    function removeCurrentUserFromPyramid() {
      // Make sure the user is logged in and is on this pyramid
      if (identityService.isAuthenticated() && vm.currentUserIsOnPyramid) {
        removingCurrentUser = true;
        // Forfeit if they have an active challenge
        if (vm.hasActiveChallenge) {
          completeChallenge(null, true, vm.currentUserPlayer);
        } else {
          // Since we are removing them ...
          vm.currentUserIsOnPyramid = false;
          vm.hasActiveChallenge = false;

          // Get an updated copy of the pyramid incase a forfeit happened
          pyramidsService.getPyramid(vm.competitionId).then(function (p) {
            // Store the updated copy locally so as not to distrupt the pyramid
            // until the player has been removed
            var pyramid = p.data;

            // Keep track of the spot they were in on the pyramid
            var openPosition = vm.currentUserPlayer.position;

            // Move all the players up 1 position that were behind the removed player
            _.forEach(pyramid.players, function (player) {
              if (player.position >= openPosition) {
                player.position -= 1;
              }
            });

            // Removed the player from the pyramid
            var removedPlayer = _.remove(pyramid.players, function (player) {
              return player._id === vm.currentUserPlayer._id;
            });

            // Make a new array of all the players still on the pyramid
            // only use the properties we want to store in the pyramid document
            var updatedPlayers = [];
            for (var i = 0; i < vm.numberOfRealPlayers - 1; ++i) {
              var updatedPlayer = {
                _id: pyramid.players[i]._id,
                firstName: pyramid.players[i].firstName,
                lastName: pyramid.players[i].lastName,
                position: pyramid.players[i].position
              };

              updatedPlayers.push(updatedPlayer);
            }

            // Call service to remove the player
            pyramidsService.removedPlayerFromPyramid(vm.competitionId, removedPlayer[0], updatedPlayers).then(function () {
              removingCurrentUser = false;
            });
          });
        }
      }
    }

    /**
     * Figure out what the appropriate action is based on the player clicking and the player being clicked
     */
    function playerClick(player) {
      // clicked on empty spot
      if (player.position === 99 && !vm.currentUserIsOnPyramid) {
        addCurrentUserToPyramid();
      }
      if (player.available === true && vm.currentUserIsOnPyramid && !vm.hasActiveChallenge) {
        swal({
          title: 'Challenge Request',
          text: 'Challenge ' + player.firstName + ' ' + player.lastName + '?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Send Challenge',
          cancelButtonText: 'Nevermind',
          closeOnConfirm: false,
          closeOnCancel: true
        }, function () {
          createChallenge(player);
          swal('Challenge Sent', player.firstName + ' ' + player.lastName + ' has been notified of the challenge.', 'success');
        });
      }
    }

    /**
     * Refresh the pyramid becasue of an update
     */
    function refreshPyramid() {
      pyramidsService.getPyramid(vm.competitionId).then(function (pyramid) {
        vm.pyramid = pyramid.data;
      });
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshPyramid();
      }
    });
  }
})();
(function () {
  'use strict';
  angular
    .module('app')
    .directive('wpmPyramid', wpmPyramid);

  function wpmPyramid() {
    var directive = {
      restrict: 'A',
      templateUrl: 'competitions/components/pyramid.html',
      replace: true,
      scope: {
        competition: '='
      },
      controller: ctrlFunc,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, $state, competitionsService, $filter, notifyService, identityService, challengesService) {
    var maxLevels = 7;
    var vm = this;
    vm.competitionId = null;
    vm.breakPoints = [];
    vm.levels = [];
    vm.numberOfBlocks = 0;
    vm.currentUserIsOnCompetition = false;
    vm.currentUserIsPending = false;
    vm.currentUserIsAdmin = false;
    vm.hasActiveChallenge = false;
    vm.activeChallengeOpponent = null;
    vm.availableChallenges = false;
    vm.confirmCreateChallenge = confirmCreateChallenge;
    vm.createChallenge = createChallenge;
    vm.confirmCancelChallenge = confirmCancelChallenge;
    vm.cancelChallenge = cancelChallenge;
    vm.completeChallenge = completeChallenge;
    vm.confirmForfeitChallenge = confirmForfeitChallenge;
    vm.forfeitChallenge = forfeitChallenge;
    vm.putPlayerOnHold = putPlayerOnHold;
    vm.cancelPlayerHold = cancelPlayerHold;
    vm.currentUserPlayer = {};
    vm.addCurrentUserToCompetition = addCurrentUserToCompetition;
    vm.confirmRemoveCurrentUserFromCompetition = confirmRemoveCurrentUserFromCompetition;
    vm.playerClick = playerClick;
    vm.numberOfRealPlayers = 0;
    vm.maxPlayers = 0;
    vm.challengesAllowed = true;

    activate();

    function activate() {
      // Determine the maximum number of players based on the maximum number of levels
      for (var i = maxLevels; i > 0; --i) {
        vm.maxPlayers += i;
      }

      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          vm.competitionId = vm.competition._id;
          checkForChallengesAllowed();
          orderPlayers();
          getPlayersStatus();
          assignLevelsToPlayers();
          calculateCompetitionBlocks();
          fillInEmptyBlocks();
        }
      });
    }

    /**
     * Check to see if challenges are currently allowed
     */
    function checkForChallengesAllowed() {
      vm.challengesAllowed = true;
      // Check for allowed weekend challenges
      if (!vm.competition.allowWeekendChallenges &&
        ((moment().format('ddd') === 'Fri' && moment().format('H') >= 17) ||
        moment().format('ddd') === 'Sat' ||
        moment().format('ddd') === 'Sun')) {
        vm.challengesAllowed = false;
      }
    }

    /**
     * Order the players by the position property of the players array in the competition object
     */
    function orderPlayers() {
      vm.competition.players = $filter('orderBy')(vm.competition.players, 'position');
    }

    /**
     * Figure out if each player is already challenged and set some stuff
     */
    function getPlayersStatus() {
      // Check for player holds
      _.forEach(vm.competition.players, function (player) {
        if (player.holdUntil && moment() < moment(player.holdUntil)) {
          player.hold = true;
          player.holdUntil = moment(player.holdUntil).format('MMM Do @ LT');
          player.class = 'hold';
        }
      });

      // Check all the active challenges for this competition and sets the status of the players
      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenges) {
        // If challenges are not allowed, cancel all active challenges
        if (!vm.challengesAllowed && challenges.data.length > 0) {
          challengesService.deleteAllActiveChallenges(vm.competitionId);
        } else {
          _.forEach(challenges.data, function (challenge) {

            var challenger = _.find(vm.competition.players, { '_id': challenge.challenger._id });
            challenger.class = 'unavailable';
            challenger.available = false;
            challenger.challenge = {
              position: 'challenger',
              opponent: _.find(vm.competition.players, { '_id': challenge.opponent._id }).displayName
            };

            var opponent = _.find(vm.competition.players, { '_id': challenge.opponent._id });
            opponent.class = 'unavailable';
            opponent.available = false;
            opponent.challenge = {
              position: 'opponent'
            };

            // Track when the challenge will expire
            if (challenge.timeLimit !== 0) {
              var timeToExpire = moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd')) * -1;
              var hoursToExpire = moment.duration(timeToExpire).asHours();
              // If the challenge has not yet expired display a countdown on the opponent
              if (timeToExpire > 0) {
                opponent.challenge.expires = hoursToExpire;
                // If the challenge expired while no one was viewing this competition complete the challenge by forfeit
              } else if (timeToExpire <= 0) {
                completeChallenge(null, true, opponent);
              }
            }
          });
        }

        vm.currentUserIsAdmin = false;
        vm.currentUserIsPending = false;
        if (identityService.isAuthenticated()) {
          // Check to see if the current user is an admin of this competition
          vm.currentUserIsAdmin = _.some(vm.competition.admins, ['_id', identityService.currentUser._id]);
          // Check to see if the current user has a pending request to join
          vm.currentUserIsPending = _.some(vm.competition.pendingPlayers, ['_id', identityService.currentUser._id]);
        }

        // Set stuff for the current user
        vm.currentUserIsOnCompetition = false;
        vm.hasActiveChallenge = false;
        _.forEach(vm.competition.players, function (player) {
          // Find the current user if they are on this competition and set some properties
          if (identityService.isAuthenticated() && player._id === identityService.currentUser._id) {
            vm.currentUserIsOnCompetition = true;
            player.class = player.class ? player.class + ' current-user': 'current-user';
            vm.currentUserPlayer = player;

            // Only check for active challenges for the current user if they are not on hold
            if (!player.hold) {
              // Check if the current user has an active challenge
              challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, player._id).then(function (challenge) {
                if (challenge.data) {
                  vm.hasActiveChallenge = true;
                  vm.activeChallengeOpponent = challenge.data.challenger._id === player._id ? challenge.data.opponent : challenge.data.challenger;
                  // Add a class to the current user's opponent'
                  var currentOpponent = _.find(vm.competition.players, {'_id': vm.activeChallengeOpponent._id});
                  currentOpponent.class = currentOpponent.class ? currentOpponent.class + ' current-opponent': 'current-opponent';
                // Now that we know about all the active challenges find the available challenges for the current user
                } else if (vm.challengesAllowed) {
                  findAvailableChallenges();
                }
              });
            }
          }
        });
      });
    }

    /**
     * Figure out where to start each new row on the competition
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
      for (var i = 0; i < vm.competition.players.length; i++) {
        if (vm.breakPoints.indexOf(i + 1) > -1) {
          level += 1;
          // Set the number of total levels
          vm.levels.push(level);
        }
        // Give each player a level
        vm.competition.players[i].level = level;
      }
    }

    // How many total blocks in this competition
    function calculateCompetitionBlocks() {
      vm.numberOfBlocks = 0;
      for (var i = _.last(vm.levels); i > 0; i--) {
        vm.numberOfBlocks += i;
      }
    }

    // Fill out the remaining blocks of the competition with empty blocks
    function fillInEmptyBlocks() {
      vm.numberOfRealPlayers = vm.competition.players.length;
      for (var i = vm.competition.players.length; i < vm.numberOfBlocks; i++) {
        vm.competition.players.push({
          firstName: 'Empty',
          lastName: 'Spot',
          displayName: 'Empty Spot',
          position: 99,
          class: 'empty',
          _id: 'XX'
        });
      }
      // We have to give levels to the new empty spots
      assignLevelsToPlayers();
    }

    // Find all the players that are available to be challenged by this user
    function findAvailableChallenges() {
      vm.availableChallenges = false;
      if (vm.currentUserIsOnCompetition && !vm.hasActiveChallenge) {
        var levelAbove = vm.currentUserPlayer.level > 1 ? vm.currentUserPlayer.level - 1 : null;
        _.forEach(vm.competition.players, function (player) {
          var waitingForPlayer = null;
          if (player.level === levelAbove && player.position !== 99 && player.class !== 'unavailable' && player.available !== false && !player.hold) {
            // Check if there is a waiting period for this player
            waitingForPlayer = _.find(vm.currentUserPlayer.waitingPeriods, { 'player': player._id });
            // If there is a waiting period for this user don't make them available
            if (waitingForPlayer && moment().isBefore(waitingForPlayer.expires)) {
              player.class = 'waiting';
              player.waitUntil = moment(waitingForPlayer.expires).format('MMM Do @ LT');
            } else {
              vm.availableChallenges = true;
              player.available = true;
              player.class = 'available';
            }
          }
        });
      }
    }

    /**
     * Show a confirmation modal before forfeiting
     * 
     * @param  {object} player, player to challenge
     */
    function confirmCreateChallenge(player) {
      swal({
        title: 'Challenge ' + player.displayName + '?',
        text: 'You can do it!',
        showCancelButton: true,
        confirmButtonClass: 'btn-success',
        confirmButtonText: 'Yes, challenge!',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        createChallenge(player);
      });
    }

    /**
     * Creates a challenge between the current user and the player selected
     * 
     * @param  {object} player, the challenged player
     */
    function createChallenge(player) {
      if (!player.available) {
        notifyService.error('Sorry, that is not a valid challenge.');
      } else {
        vm.hasActiveChallenge = true;
        var challenge = {
          type: vm.competition.type,
          competitionName: vm.competition.name,
          competitionId: vm.competitionId,
          complete: false,
          forfeit: false,
          timeLimit: vm.competition.forfeitDays,
          challenger: {
            _id: vm.currentUserPlayer._id,
            email: vm.currentUserPlayer.email,
            firstName: vm.currentUserPlayer.firstName,
            lastName: vm.currentUserPlayer.lastName,
            displayName: vm.currentUserPlayer.displayName,
            position: vm.currentUserPlayer.position
          },
          opponent: {
            _id: player._id,
            email: player.email,
            firstName: player.firstName,
            lastName: player.lastName,
            displayName: player.displayName,
            position: player.position
          }
        };
        // Create the challenge
        // Websocket event will refresh the competition
        challengesService.createPyramidChallenge(challenge).then(function () {
          // Allow the challenged player to use a hold after the challenge
          if (player.preventHold) {
            cancelPlayerHold(player, true);
          }
        });
      }
    }

    // Confirm the cancel challenge
    function confirmCancelChallenge() {
      swal({
        title: 'Cancel challenge',
        text: 'Are you sure you want to cancel this challenge?',
        showCancelButton: true,
        confirmButtonClass: 'btn-danger',
        confirmButtonText: 'Yes, cancel it',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        cancelChallenge();
      });
    }

    // Allows the challenger to cancel a challenge
    // Informs the opponent to ask the challenger to cancel the opponent
    function cancelChallenge() {
      challengesService.getActiveChallengeByCompetitionByPlayer(vm.competitionId, vm.currentUserPlayer._id).then(function (challenge) {
        if (challenge.data) {
          // Allow the challenger to cancel the challenge
          if (challenge.data.challenger._id === vm.currentUserPlayer._id) {
            challengesService.cancelPyramidChallenge(challenge.data).then(function () {
              vm.hasActiveChallenge = false;
            });
          }
        }
      });
    }

    /**
     * Show a confirmation modal before placing hold
     * 
     * @param  {object} player, player to put on hold
     */
    function putPlayerOnHold(player) {
      swal({
        title: 'Hold my spot!',
        text: 'You\'ll have to remove the hold when you\'re ready to play again',
        showCancelButton: true,
        confirmButtonClass: 'btn-primary',
        confirmButtonText: 'Hold Please!',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true,
      }, function () {
        competitionsService.putPlayerOnHold(vm.competitionId, player);
      });
    }

    /**
     * Cancel the player hold
     * Either by the player, removing their own hold
     * Or the player being challenged
     * 
     * @param  {object} player to remove the hold from
     * @param  {boolean} challenged, if the hold is being removed becasue of a challenge
     */
    function cancelPlayerHold(player, challenged) {
      competitionsService.cancelPlayerHold(vm.competitionId, player._id, player.displayName, challenged);
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

        var loser, winner = null;
        if (challenge.data.winner === 'opponent') {
          winner = challenge.data.opponent;
          loser = challenge.data.challenger;
        } else {
          winner = challenge.data.challenger;
          loser = challenge.data.opponent;
        }
        competitionsService.createWaitingPeriod(vm.competitionId, loser._id, winner._id, vm.competition.waitingPeriodDays);

        // Swap positions and then complete the challenge or just complete the challenge
        // Websocket event will refresh the competition
        if (swapPositions) {
          competitionsService.swapPositions(vm.competitionId, challenge.data.opponent, challenge.data.challenger).then(function () {
            challengesService.completePyramidChallenge(challenge.data).then(function () {
              if (removingCurrentUser) {
                removeCurrentUserFromCompetition();
              }
            });
          });
        } else {
          challengesService.completePyramidChallenge(challenge.data).then(function () {
            if (removingCurrentUser) {
              removeCurrentUserFromCompetition();
            }
          });
        }
      });
    }

    /**
     * Show a confirmation modal before forfeiting
     * @param  {object} player
     */
    function confirmForfeitChallenge(player) {
      swal({
        title: 'Forfeit challenge?',
        text: 'Are you sure you want to forfeit this challenge?',
        showCancelButton: true,
        confirmButtonClass: 'btn-danger',
        confirmButtonText: 'Yes, forfeit',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        forfeitChallenge(player);
      });
    }

    /**
     * Calls the complete challnge function with the forfeiting player
     * @param  {object} player
     */
    function forfeitChallenge(player) {
      completeChallenge(null, true, player);
    }

    /**
     * Adds the current user the competition 
     * if they're not already on it and there's space
     */
    function addCurrentUserToCompetition() {
      if (identityService.isAuthenticated()) {
        if (vm.numberOfRealPlayers < vm.maxPlayers) {
          var player = {
            _id: identityService.currentUser._id,
            firstName: identityService.currentUser.firstName,
            lastName: identityService.currentUser.lastName,
            displayName: identityService.currentUser.displayName,
            email: identityService.currentUser.username,
            position: vm.numberOfRealPlayers + 1
          };
          if (!vm.competition.restrictJoins) {
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
              competitionsService.addPlayerToCompetition(vm.competitionId, player);
              swal('Welcome Aboard!', 'Now start fighting your way to the top', 'success');
            });  
          } else {
            swal({
              title: 'Send Join Request?',
              text: 'This is a closed competition so an admin must approve your request',
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Send Request',
              cancelButtonText: 'Nevermind',
              closeOnConfirm: false,
              closeOnCancel: true
            }, function () {
              competitionsService.addPlayerToCompetitionRequest(vm.competition, player).then(function () {
                vm.currentUserIsPending = true;
              });
              swal('Request Sent', 'You will receive an email once an admin processes the request.', 'success');
            });
          }
        } else {
          notifyService.warning('Sorry, this competition is full');
        }
      } else {
        notifyService.warning('Please login to join a competition');
        $state.previous = 'competitions.view';
        $state.prevParams = {'competitionId': vm.competitionId};
        $state.go('login');
      }
    }

    /**
     * Display confirmation modal for leaving the competition 
     */
    function confirmRemoveCurrentUserFromCompetition() {
      swal({
        title: 'Leave Competition?',
        text: 'You will lose your spot and forfeit any active challenges.',
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave',
        confirmButtonClass: 'btn-danger',
        cancelButtonText: 'No, stay',
        closeOnConfirm: false,
        closeOnCancel: true
      }, function () {
        removeCurrentUserFromCompetition();
        swal('OK, you\'r out!', 'You\'ve been removed from the competition.', 'success');
      });
    }

    // Use this to enforce order of operations when the player to be removed had an active challenge
    var removingCurrentUser = false;

    /**
     * Removes the current user from the competition
     */
    function removeCurrentUserFromCompetition() {
      // Make sure the user is logged in and is on this competition
      if (identityService.isAuthenticated() && vm.currentUserIsOnCompetition) {
        removingCurrentUser = true;
        // Forfeit if they have an active challenge
        if (vm.hasActiveChallenge) {
          completeChallenge(null, true, vm.currentUserPlayer);
        } else {
          // Since we are removing them ...
          vm.currentUserIsOnCompetition = false;
          vm.hasActiveChallenge = false;

          // Get an updated copy of the competition incase a forfeit happened
          competitionsService.getCompetition(vm.competitionId).then(function (p) {
            // Store the updated copy locally so as not to distrupt the competition
            // until the player has been removed
            var competition = p.data;

            // Keep track of the spot they were in on the competition
            var openPosition = vm.currentUserPlayer.position;

            // Move all the players up 1 position that were behind the removed player
            _.forEach(competition.players, function (player) {
              if (player.position >= openPosition) {
                player.position -= 1;
              }
            });

            // Removed the player from the competition
            var removedPlayer = _.remove(competition.players, function (player) {
              return player._id === vm.currentUserPlayer._id;
            });

            // Make a new array of all the players still on the competition
            // only use the properties we want to store in the competition document
            var updatedPlayers = [];
            for (var i = 0; i < vm.numberOfRealPlayers - 1; ++i) {
              var updatedPlayer = {
                _id: competition.players[i]._id,
                email: competition.players[i].email,
                firstName: competition.players[i].firstName,
                lastName: competition.players[i].lastName,
                displayName: competition.players[i].displayName,
                position: competition.players[i].position
              };

              updatedPlayers.push(updatedPlayer);
            }

            // Call service to remove the player
            competitionsService.removedPlayerFromCompetition(vm.competitionId, removedPlayer[0], updatedPlayers).then(function () {
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
      if (player.position === 99 && !vm.currentUserIsOnCompetition) {
        addCurrentUserToCompetition();
      } else {
        player.showChallengeModal = !player.showChallengeModal;
      }
    }

    /**
     * Refresh the competition becasue of an update
     */
    function refreshCompetition() {
      competitionsService.getCompetition(vm.competitionId).then(function (competition) {
        vm.competition = competition.data;
      });
    }

    // Watch for websocket event
    $scope.$on('ws:competition_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        notifyService.info(challengeDetails.description);
        refreshCompetition();
      }
    });
  }
})();
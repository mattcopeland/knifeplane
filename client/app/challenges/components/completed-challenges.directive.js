(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmCompletedChalleneges', wpmCompletedChalleneges);

  function wpmCompletedChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '=',
        allowDelete: '=',
        numberOfChallenges: '@',
        challengesPerPage: '@'
      },
      templateUrl: 'challenges/components/completed-challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, $state, challengesService, ngTableParams) {
    var vm = this;
    vm.challenges = null;
    vm.deleteChallenge = deleteChallenge;

    activate();

    function activate() {
      $scope.$watch('vm.competition', function() {
        if (vm.competition) {
          getCompletedChallenges();
        }
      });
    }

    function getCompletedChallenges() {
      // Get completed challenges in this competition
      challengesService.getCompletedChallengesByCompetition(vm.competition._id, vm.numberOfChallenges).then(function (challenges) {
        vm.challenges = challenges.data;
        if (challenges.data.length > 0) {
        
          //Data Table info
          vm.tableData = new ngTableParams({
            page: 1, // show first page
            count: vm.challengesPerPage || 5 // count per page
          }, {
            counts: [], // hides page sizes
            total: vm.challenges.length, // length of data
            getData: function ($defer, params) {
              $defer.resolve(vm.challenges.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
          });

          _.forEach(vm.challenges, function (challenge) {
            challenge.loser = challenge.winner === 'challenger' ? 'opponent' : 'challenger';
            if (challenge.type === 'versus') {
              // If more than 1 player per team than use Team name
              if (vm.competition.players.length > 2) {
                challenge.challenger.displayName = 'Team ' + challenge.challenger.team;
                challenge.opponent.displayName = 'Team ' + challenge.opponent.team;
              // If only 1 player per team than just use the players names
              } else {
                challenge.challenger.displayName = _.find(vm.competition.players, { 'position':  challenge.challenger.team}).displayName;
                challenge.opponent.displayName = _.find(vm.competition.players, { 'position':  challenge.opponent.team}).displayName;
              }
            }
            challenge.whenCompleted = moment(challenge.completed).calendar(null, {
              sameDay: '[Today]',
              nextDay: '[Tomorrow]',
              nextWeek: 'dddd',
              lastDay: '[Yesterday]',
              lastWeek: '[Last] dddd',
              sameElse: 'MMM DD, YYYY'
            });
          });
        }
      });
    }

    function deleteChallenge(challengeId, $index) {
      swal({
        title: 'Delete Challenge Result?',
        text: 'You\'ll still need to reorder the players on your own',
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        challengesService.deleteChallenge(vm.competition._id, challengeId).then (function () {
          vm.challenges.splice($index, 1);
        });
      });
    }
  }
})();
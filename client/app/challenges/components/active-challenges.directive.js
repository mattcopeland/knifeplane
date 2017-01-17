(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmActiveChalleneges', wpmActiveChalleneges);

  function wpmActiveChalleneges() {
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
      templateUrl: '/challenges/components/active-challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, challengesService, ngTableParams) {
    var vm = this;
    vm.challenges = null;
    vm.deleteChallenge = deleteChallenge;

    activate();

    function activate() {
      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          getActiveChallenges();
        }
      });
    }

    function getActiveChallenges() {
      challengesService.getActiveChallengesByCompetition(vm.competition._id).then(function (challenges) {
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
            if (challenge.timeLimit !== 0) {
              var timeToExpire = moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd')) * -1;
              challenge.expires = moment.duration(timeToExpire).asHours();
            }
          });
        }
      });
    }

    function deleteChallenge(challengeId, $index) {
      swal({
        title: 'Delete Challenge Result?',
        text: 'It\'ll be like it never happened',
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
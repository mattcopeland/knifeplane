(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpActiveChalleneges', kpActiveChalleneges);

  function kpActiveChalleneges() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competitionId: '@'
      },
      templateUrl: '/challenges/components/active-challenges.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, challengesService) {
    var vm = this;
    vm.challenges = [];

    activate();

    function activate() {
      getActiveChallenges();
    }

    function getActiveChallenges() {
      vm.challenges = [];
      challengesService.getActiveChallengesByCompetition(vm.competitionId).then(function (challenges) {
        if (challenges.data.length > 0) {
          vm.challenges = challenges.data;
          _.forEach(vm.challenges, function (challenge) {
            if (challenge.timeLimit !== 0) {
              challenge.expires = (moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd'),'s')) * -1;
            }
          });
        }
      });
    }

    // Watch for websocket event
    $scope.$on('ws:pyramid_updated', function (_, challengeDetails) {
      if (vm.competitionId === challengeDetails.competitionId) {
        getActiveChallenges();
      }
    });
  }
})();
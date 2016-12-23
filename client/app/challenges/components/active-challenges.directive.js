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
        competition: '='
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
      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          getActiveChallenges();
        }
      });
    }

    function getActiveChallenges() {
      vm.challenges = [];
      challengesService.getActiveChallengesByCompetition(vm.competition._id).then(function (challenges) {
        if (challenges.data.length > 0) {
          vm.challenges = challenges.data;          
          _.forEach(vm.challenges, function (challenge) {
            if (challenge.type === 'versus') {
              challenge.challenger.displayName = 'Team ' + challenge.challenger.team;
              challenge.opponent.displayName = 'Team ' + challenge.opponent.team;
            }
            if (challenge.timeLimit !== 0) {
              challenge.expires = (moment().diff(moment(challenge.created).add(challenge.timeLimit, 'd'),'s')) * -1;
            }
          });
        }
      });
    }
  }
})();
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
        pyramid: '='
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
      $scope.$watch('vm.pyramid', function () {
        if (vm.pyramid) {
          getActiveChallenges();
        }
      });
    }

    function getActiveChallenges() {
      vm.challenges = [];
      challengesService.getActiveChallengesByCompetition(vm.pyramid._id).then(function (challenges) {
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
  }
})();
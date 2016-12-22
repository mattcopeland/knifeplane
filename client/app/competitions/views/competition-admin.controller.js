(function () {
  'use strict';
  angular.module('app').controller('CompetitionAdminCtrl', CompetitionAdminCtrl);

  function CompetitionAdminCtrl($scope, $state, $stateParams, $filter, competitionsService, identityService, notifyService, challengesService) {
    var vm = this;
    vm.competitionId = null;
    vm.updateCompetitionRestrictJoins = updateCompetitionRestrictJoins;
    vm.deleteCompetition = deleteCompetition;

    activate();

    function activate() {
      if ($stateParams.competitionId) {
        vm.competitionId = $stateParams.competitionId;
        refreshCompetition();
      } else {
        $state.go('competitions.myCompetitions');
      }
    }

    function refreshCompetition() {
      competitionsService.getCompetition(vm.competitionId).then(function (competition) {
        // Check to see if this user is an admin of this competition
        if (competition.data && _.some(competition.data.admins, ['_id', identityService.currentUser._id])) {
          vm.isAdmin = true;
          // Display the players in the proper order
          competition.data.players = $filter('orderBy')(competition.data.players, 'position');
          vm.competition = competition.data;
        } else {
          $state.go('competitions.myCompetitions');
        }
      });
      challengesService.getCompletedChallengesByCompetition(vm.competitionId).then(function (challenges) {
        vm.challenges = challenges.data;
      });
    }

    // Perform the updates that were requsted
    function updateCompetitionRestrictJoins() {
      competitionsService.getCompetition(vm.competitionId).then(function (competition) {
        var updatedCompetition = competition.data;
        updatedCompetition.restrictJoins = vm.competition.restrictJoins;
        competitionsService.updateCompetition(updatedCompetition);
      });      
    }

    function deleteCompetition() {
      swal({
        title: 'Delete Competition?',
        text: 'This can not be undone',
        type: 'error',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Nevermind',
        closeOnConfirm: true,
        closeOnCancel: true
      }, function () {
        competitionsService.deleteCompetition(vm.competitionId).then(function () {
          $state.go('competitions.myCompetitions');
        });
      });
    }

    // Watch for websocket event
    $scope.$on('ws:competition_updated', function (_, competitionDetails) {
      if (vm.competitionId === competitionDetails.competitionId) {
        notifyService.info(competitionDetails.description);
        refreshCompetition();
      }
    });

    // Watch for websocket event
    $scope.$on('ws:competition_deleted', function (_, competitionDetails) {
      if (vm.competitionId === competitionDetails.competitionId) {
        notifyService.info(competitionDetails.description);
        $state.go('competitions.myCompetitions');
      }
    });
  }
})();
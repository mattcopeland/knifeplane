(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmUpdateAdmins', wpmUpdateAdmins);

  function wpmUpdateAdmins() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'vm',
      restrict: 'A',
      scope: {
        competition: '='
      },
      templateUrl: '/competitions/components/update-admins.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, competitionsService, challengesService, userService, identityService) {
    var removedAdmins = [];
    var originalAvailableAdmins = [];
    var vm = this;
    vm.availableAdmins = [];
    vm.addedAdmins = [];
    vm.userIsPrimaryAdmin = false;
    vm.updateCompetition = updateCompetition;
    vm.cancelUpdate = cancelUpdate;
    vm.removeAdmin = removeAdmin;
    vm.addAdmin = addAdmin;
    vm.disableSubmit = true;

    activate();

    function activate() {
      $scope.$watch('vm.competition', function () {
        if (vm.competition) {
          vm.addedAdmins = _.cloneDeep(vm.competition.admins);
          vm.disableSubmit = true;
          vm.userIsPrimaryAdmin = _.find(vm.competition.admins, {'primary': true})._id === identityService.currentUser._id ? true: false;
          getAvailableAdmins();
        }
      });
    }

    function getAvailableAdmins() {
      vm.availableAdmins = [];
      removedAdmins = [];
      userService.getVerifiedUsers().then(function (users) {
        // Remove the current admins from the list of available admins
        _.forEach(vm.competition.admins, function (competitionAdmin) {
          _.remove(users.data, function (availableAdmin){
            return competitionAdmin._id === availableAdmin._id;
          });
        });
        // Only use certain properties of the user for the admin record
        _.forEach(users.data, function (availableAdmin) {
          vm.availableAdmins.push({
            firstName: availableAdmin.firstName,
            lastName: availableAdmin.lastName,
            displayName: availableAdmin.displayName,
            email: availableAdmin.username,
            _id: availableAdmin._id
          });
        });

        originalAvailableAdmins = _.cloneDeep(vm.availableAdmins);
      });
    }

    // Perform the updates that were requsted
    function updateCompetition() {
      vm.competition.admins = vm.addedAdmins;
      competitionsService.updateCompetition(vm.competition).then(function () {
        vm.disableSubmit = true;
      });   
    }

    // Cancel the update and put everything back to the orginal
    function cancelUpdate() {
      removedAdmins = [];
      vm.addedAdmins = _.cloneDeep(vm.competition.admins);
      vm.availableAdmins = _.cloneDeep(originalAvailableAdmins);
    }

    /**
     * Removes an admin from the competition
     * Queue up the admins to be removed and remove them from the display
     * @param  {object} admin
     */
    function removeAdmin(admin) {
      removedAdmins.push(admin);
      vm.availableAdmins.push(_.remove(vm.addedAdmins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }

    /**
     * Adds an admin to the competition
     * @param  {object} admin
     */
    function addAdmin(admin) {
      vm.addedAdmins.push(_.remove(vm.availableAdmins, {_id: admin._id})[0]);
      vm.disableSubmit = false;
    }
  }
})();
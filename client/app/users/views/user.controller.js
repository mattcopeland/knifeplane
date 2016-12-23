(function () {
  'use strict';
  angular.module('app').controller('UserCtrl', UserCtrl);

  function UserCtrl(identityService, userService, notifyService) {
    var vm = this;
    vm.user =  {
      _id:  identityService.currentUser._id,
      firstName: identityService.currentUser.firstName,
      lastName: identityService.currentUser.lastName,
      displayName: identityService.currentUser.displayName
    };
    vm.updateUser = updateUser;
    vm.userForm = {};

    activate();

    function activate() {}

    function updateUser (user) {
      if (user.password !== user.confirmPassword) {
        notifyService.error('Passwords don\'t match!');
      } else {
        userService.updateUser(user).then(function () {
          notifyService.success('Your information has been updated');
          vm.userForm.$setPristine();
          // Update the current user with the updated data
          var currentUserClone = angular.copy(identityService.currentUser);
          angular.extend(currentUserClone, user);
          identityService.currentUser = currentUserClone;
          vm.user.confirmPassword = vm.user.password = '';
        });
      }
    }
  }
})();
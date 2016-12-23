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
        // If any of the names were updated we'll need to update them in the other collections'
        var userUpdates = {
          _id: user._id
        };
        if (user.firstName !== identityService.currentUser.firstName || user.lastName !== identityService.currentUser.lastName || user.displayName !== identityService.currentUser.displayName) {
          userUpdates.firstName = user.firstName;
          userUpdates.lastName = user.lastName;
          userUpdates.displayName = user.displayName;
        }
        if (user.password && user.password.lentgh > 0) {
          userUpdates.password = user.password;
        }
        userService.updateUser(userUpdates).then(function () {
          notifyService.success('Your information has been updated');
          vm.userForm.$setPristine();
          // Update the current user with the updated data
          var currentUserClone = angular.copy(identityService.currentUser);
          angular.extend(currentUserClone, userUpdates);
          identityService.currentUser = currentUserClone;
          vm.user.confirmPassword = vm.user.password = '';
        });
      }
    }
  }
})();
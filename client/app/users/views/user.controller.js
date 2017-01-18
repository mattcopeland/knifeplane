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

    function activate() {
      if (!identityService.currentUser.displayName) {
        vm.user.displayName = identityService.currentUser.firstName + ' ' + identityService.currentUser.lastName;
      }
    }

    function updateUser (user) {
      // Prevent multiple people from having the same display name
      var displayNames = [];
      userService.getAllUsers().then(function (users) {
        _.forEach(users.data, function (user) {
          displayNames.push(user.displayName.toLowerCase());
        });

        if (user.password !== user.confirmPassword) {
          notifyService.error('Passwords don\'t match!');
        } else if (user.firstName.length < 1 || user.lastName.length < 1 || user.displayName.length < 1) {
          notifyService.error('Don\'t leave names blank!  How will people know who you are?');
        } else if (_.indexOf(displayNames, user.displayName.toLowerCase()) > -1) {
          notifyService.error('Sorry, someone else is already using that display name');
        } else if (!identityService.isAuthorized('super-admin') && user.displayName.toLowerCase().indexOf('maestro') > -1) {
          notifyService.error('Sorry, there\'s only one Maestro');
        } else {
          // If any of the names were updated we'll need to update them in the other collections'
          var userUpdates = {
            _id: user._id
          };
          if ((user.firstName !== identityService.currentUser.firstName && user.firstName.length > 0) || (user.lastName !== identityService.currentUser.lastName && user.lastName.length > 0) || (user.displayName !== identityService.currentUser.displayName && user.displayName.length > 0)) {
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
      });
    }
  }
})();
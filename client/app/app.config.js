(function () {
  'use strict ';
  angular.module('app').config(configuration);

  function configuration(NotificationProvider) {
    NotificationProvider.setOptions({
      delay: 6000,
      startTop: 6,
      startRight: 6
    });
  }
})();
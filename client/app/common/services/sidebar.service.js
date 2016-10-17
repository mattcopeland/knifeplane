(function () {
  'use strict';
  angular
    .module('app')
    .factory('sidebarService', sidebarService);

  function sidebarService() {
    var sidebarStatus = {
      left: false,
      right: false
    };
    var service = {
      getSidebarStatus: getSidebarStatus,
      setSidebarStatus: setSidebarStatus
    };

    return service;

    function getSidebarStatus() {
      return sidebarStatus;
    }

    function setSidebarStatus(status) {
      sidebarStatus.left = status;
    }
  }
})();
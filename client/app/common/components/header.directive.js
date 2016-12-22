(function () {
  'use strict';

  angular
    .module('app')
    .directive('wpmHeader', wpmHeader);

  function wpmHeader() {
    var directive = {
      bindToController: true,
      controller: ctrlFunc,
      controllerAs: 'headerCtrl',
      restrict: 'A',
      templateUrl: '/common/components/header.html'
    };
    return directive;
  }

  /* @ngInject */
  function ctrlFunc($scope, sidebarService, identityService, authService, alertsService) {
    var headerCtrl = this;
    headerCtrl.indentity = identityService;
    headerCtrl.logout = logout;
    headerCtrl.sidebarStatus = sidebarService.getSidebarStatus();
    headerCtrl.toggleSidebar = toggleSidebar;
    headerCtrl.clearAlert = clearAlert;
    headerCtrl.clearAllAlerts = clearAllAlerts;
    headerCtrl.alerts = [];

    activate();

    function activate() {
      getActiveAlerts();
      $scope.$watch('headerCtrl.indentity.currentUser', function () {
        if (identityService.isAuthenticated()) {
          getActiveAlerts();
        }
      });
    }

    function getActiveAlerts() {
      headerCtrl.alerts = [];
      if (identityService.isAuthenticated()) {
        alertsService.getActiveAlertsByPlayer(identityService.currentUser._id).then(function (alerts) {
          headerCtrl.alerts = alerts.data;
        });
      }
    }

    function clearAlert(clearAlert, index) {
      alertsService.clearAlert(clearAlert).then(function () {
        headerCtrl.alerts.splice(index, 1);
      });
    }

    function clearAllAlerts() {
      alertsService.clearAllAlertsByPlayer(identityService.currentUser._id).then(function () {
        headerCtrl.alerts = [];
      });
    }

    function toggleSidebar() {
      sidebarService.setSidebarStatus(!headerCtrl.sidebarStatus.left);
    }

    function logout() {
      authService.logout();
    }

    // Watch for websocket event
    $scope.$on('ws:update_alerts', function (e, alerts) {
      if (identityService.isAuthenticated() && _.some(alerts, ['userId', identityService.currentUser._id])) {
        getActiveAlerts();
      }
    });
  }
})();
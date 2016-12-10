(function () {
  'use strict';

  angular
    .module('app')
    .directive('kpHeader', kpHeader);

  function kpHeader() {
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
  function ctrlFunc($scope, sidebarService, identityService, authService, notificationsService) {
    var headerCtrl = this;
    headerCtrl.indentity = identityService;
    headerCtrl.logout = logout;
    headerCtrl.sidebarStatus = sidebarService.getSidebarStatus();
    headerCtrl.toggleSidebar = toggleSidebar;
    headerCtrl.clearNotification = clearNotification;
    headerCtrl.clearAllNotifications = clearAllNotifications;
    headerCtrl.notifications = [];

    activate();

    function activate() {
      getActiveNotifications();
    }

    function getActiveNotifications() {
      if (identityService.isAuthenticated()) {
        notificationsService.getActiveNotificationsByPlayer(identityService.currentUser._id).then(function (notifications) {
          headerCtrl.notifications = notifications.data;
        });
      }
    }

    function clearNotification(clearNotification, index) {
      notificationsService.clearNotification(clearNotification).then(function () {
        headerCtrl.notifications.splice(index, 1);
      });
    }

    function clearAllNotifications() {
      notificationsService.clearAllNotificationsByPlayer(identityService.currentUser._id).then(function () {
        headerCtrl.notifications = [];
      });
    }

    function toggleSidebar() {
      sidebarService.setSidebarStatus(!headerCtrl.sidebarStatus.left);
    }

    function logout() {
      authService.logout();
    }

    // Watch for websocket event
    $scope.$on('ws:notification_created', function (_, notificationDetails) {
      if (identityService.isAuthenticated() && notificationDetails.userId === identityService.currentUser._id) {
        getActiveNotifications();
      }
    });
  }
})();
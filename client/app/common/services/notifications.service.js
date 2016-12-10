(function () {
  'use strict';
  angular.module('app').factory('notificationsService', notificationsService);

  function notificationsService($http) {
    var service = {
      getActiveNotificationsByPlayer: getActiveNotificationsByPlayer,
      clearNotification: clearNotification,
      clearAllNotificationsByPlayer: clearAllNotificationsByPlayer
    };

    return service;

    /**
     * Gets uncleared notifications for a user from the database
     *
     * @param {String} userId id for the user
     * @return {Array} notifications
     */
    function getActiveNotificationsByPlayer(userId) {
      return $http.get('/api/notifications/', {
        params: {
          userId: userId
        }
      });
    }

    /**
     * Marks a notifications as cleared
     *
     * @param {String} notificationId id for the notification
     * @return {String} Status
     */
    function clearNotification(notificationId) {
      return $http.put('/api/notification/clear', {
        notificationId: notificationId
      });
    }

    /**
     * Marks all unviewed notifications as viewed for a user
     *
     * @param {number} userId id for the user
     * @return {String} Status
     */
    function clearAllNotificationsByPlayer(userId) {
      return $http.put('/api/notifications/clear', {
        userId: userId
      });
    }
  }
})();
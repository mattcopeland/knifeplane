(function () {
  'use strict';
  angular.module('app').factory('alertsService', alertsService);

  function alertsService($http) {
    var service = {
      getActiveAlertsByPlayer: getActiveAlertsByPlayer,
      clearAlert: clearAlert,
      clearAllAlertsByPlayer: clearAllAlertsByPlayer
    };

    return service;

    /**
     * Gets uncleared alerts for a user from the database
     *
     * @param {String} userId id for the user
     * @return {Array} alerts
     */
    function getActiveAlertsByPlayer(userId) {
      return $http.get('/api/alerts/', {
        params: {
          userId: userId
        }
      });
    }

    /**
     * Marks a alerts as cleared
     *
     * @param {String} alertId id for the alert
     * @return {String} Status
     */
    function clearAlert(alertId) {
      return $http.put('/api/alert/clear', {
        alertId: alertId
      });
    }

    /**
     * Marks all unviewed alerts as viewed for a user
     *
     * @param {number} userId id for the user
     * @return {String} Status
     */
    function clearAllAlertsByPlayer(userId) {
      return $http.put('/api/alerts/clear', {
        userId: userId
      });
    }
  }
})();
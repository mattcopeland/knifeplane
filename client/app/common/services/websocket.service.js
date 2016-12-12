(function () {
  'use strict';
  angular.module('app').factory('websocketService', websocketService).run(function (websocketService) {
    websocketService.connect();
  });

  function websocketService($rootScope, $window, $timeout) {
    var connection;
    var retrySeconds = [3, 10, 100, 1000];
    var retry = 0;
    var service = {
      connect: connect,
      send: send
    };

    return service;

    function websocketHost() {
      if ($window.location.protocol === 'https:') {
        return 'wss://' + $window.location.host;
      } else {
        return 'ws://' + $window.location.host;
      }
    }

    function connect() {
      connection = new WebSocket(websocketHost());

      connection.onmessage = function (e) {
        retry = 0;
        var payload = JSON.parse(e.data);
        $rootScope.$broadcast('ws:' + payload.topic, payload.data);
      };

      connection.onclose = function () {
        if (retry < retrySeconds.length) {
          console.log('WebSocket closed. Reconnecting...');
          $timeout(connect, retrySeconds[retry]*1000);
          retry += 1;
        } else {
          console.log('Giving up on WebSocket');
        }
      };
    }

    function send(topic, data) {
      var json = JSON.stringify({
        topic: topic,
        data: data
      });
      connection.send(json);
    }
  }
})();


angular.module('smartspaces', [ 'ui.bootstrap' ])

  // Interaction controller
  .controller('InteractionCtrl', function($scope, $http) {

  })

  // Search controller
  .controller('SearchCtrl', function($scope, $http, $window) {

    $scope.target;
    $scope.places = [];
    loadPlaces();

    function loadPlaces() {
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get('/places')
        .success(function(data, status, headers, config) {
          $scope.places = data;
        })
        .error(function(data, status, headers, config) {
          console.log('Error: could not load /places');
        });
    }

    $scope.visit = function() {
      $window.location.href = $scope.target;
    }

  });

'use strict';

angular.module('boatServerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addData', {
        templateUrl: 'app/addData/addData.html',
        controller: 'AddDataCtrl'
      });
  });

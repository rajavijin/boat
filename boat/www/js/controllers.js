angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  user = JSON.parse(localStorage.getItem('user')) || user;
  $scope.username = user.name;
  $scope.uid = localStorage.getItem('uid') || '';
  if($scope.uid) {
    $scope.authorized = true;
    $scope.menuLinks = MyService.getMenus();   
  } else {
    $scope.authorized = false;
    $scope.menuLinks = {"Links":[{}]};
  }
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  // Form data for the login modal
  $scope.loginData = {};

 /* // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };*/
})
.controller('AddtripCtrl', function($scope,  $stateParams) {
  $scope.addtrip = {};
  $scope.submit = function() {
    console.log('addtrip', $scope.addtrip);
  }
})
.controller('AddusersCtrl', function($scope,  $stateParams) {
  $scope.addusers = {};
  $scope.created = function() {
    console.log('addusers',$scope.addusers);
  }
})
.controller('AllusersCtrl', function($scope,  $stateParams) {
})
.controller('ProfileCtrl', function($scope,  $stateParams) {
})
.controller('LogoutCtrl', function($scope,  $stateParams) {
})
.controller('HomeCtrl',function($scope, $state, MyService){
  $scope.user = {
    email: null,
    password:null,
  }
  $scope.login = function() { 
    if (($scope.user.email == null) || ($scope.user.password == null)) {
      alert('Please fill the fields');
    }
    else {
      MyService.login($scope.user).then(function(user) {
        if(user) {
          $state.go("app.dashboard", {},  {'reload': true});
        }
      })
    }
    console.log("user details", $scope.user);
  }
})
.controller('LogoutCtrl', function($scope, $http, $state) {
    delete $http.defaults.headers.common.Authorization;
    console.log("Logging out:");
    localStorage.removeItem('uid');
    localStorage.removeItem("DashParam");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    $state.go("home", {}, {reload: true});
});
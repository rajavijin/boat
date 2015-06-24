angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, MyService) {
  user = JSON.parse(localStorage.getItem('user')) || user;
  $scope.username = user.name;
  $scope.uid = localStorage.getItem('uid') || '';
  if($scope.uid) {
    $scope.authorized = true;
    //$scope.menuLinks = MyService.getMenus();   
  } else {
    $scope.authorized = false;
    //$scope.menuLinks = {"Links":[{}]};
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
.controller('DashboardCtrl', function($scope, $state, MyService) {
  $scope.getTrips = function() {
    var params = {};
    params.boatid = user.boatid;
    if(MyService.online()) {
      MyService.getTrips(params).then(function(trips) {
        console.log("Trips", trips);
        if(trips) {
          $scope.dashboardStatus = true;
          processVal(trips);
        } else {
          $scope.dashboardStatus = false;
        }
      })
    } else {

    }
  }
  var processVal = function(trips) {
    var incomeLabels = [];
    var income = [];
    var spending = [];
    for (var i = 0; i < trips.length; i++) {
      incomeLabels.push(trips[i].name);
      income.push(trips[i].income);
      spending.push(trips[i].totalspending);
    }
    $scope.incomeConfig = {
      chart: {renderTo: 'income',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Income"},plotOptions: {column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Mark',data: income}]
    }
    $scope.spendingConfig = {
      chart: {renderTo: 'spending',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Spending"},plotOptions: {column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Mark',data: spending}]
    }
  }
})
.controller('AllTripsCtrl', function($scope, $state, MyService) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getTrips = function() {
    var params = {};
    params.boatid = user.boatid;
    if(MyService.online()) {
      MyService.getTrips(params).then(function(trips) {
        console.log("Trips", trips);
        if(trips) {
          $scope.allStudents = true;
        } else {
          $scope.allStudents = false;
        }
        $scope.trips = trips;       
      })
    } else {

    }
  }
})
.controller('TripDashboardCtrl', function($scope, $state, $stateParams, MyService) {
  $scope.getTripData = function() {
    var params = {};
    params.boatid = user.boatid;
    params._id = $stateParams.id;
    if(MyService.online()) {
      MyService.getTrip(params).then(function(trip) {
        console.log("Trips", trip);       
        var startdate = new Date(trip.startdate);
        var enddate = new Date(trip.enddate);
        trip.startdate = startdate.getDate() +' '+months[startdate.getMonth()]+' '+startdate.getFullYear();
        trip.enddate = enddate.getDate() +' '+months[enddate.getMonth()]+' '+enddate.getFullYear();
        $scope.trip = trip;
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    } else {

    }
  }
})
.controller('AddtripCtrl', function($scope, $state, MyService) {
  console.log("current user", user);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerpercentage = user.ownerpercentage;
  addtrip.workerpercentage = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  //default values
  addtrip.petrol = 100;
  addtrip.ice = 100;
  addtrip.food = 100;
  addtrip.extra = 100;
  addtrip.net = 100;
  $scope.addtrip = addtrip;
  $scope.user = user;
  $scope.submit = function() {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var totalDays = Math.round(Math.abs(($scope.addtrip.startdate.getTime() - $scope.addtrip.enddate.getTime())/(oneDay)));
    var tripdetails = $scope.addtrip;
    tripdetails.members = [];
    var totalmembers = 0;
    var totalpartitions = 0;
    tripdetails.name = tripdetails.startdate.getDate() +' '+months[tripdetails.startdate.getMonth()]+' '+tripdetails.startdate.getFullYear();
    for (var i = 0; i < user.members.length; i++) {
      if(tripdetails.allmembers[user.members[i]._id]) {
        totalmembers++;
        totalpartitions += user.members[i].salarylevel;
      }
    };
    console.log("total days", totalDays);
    console.log("total Members", totalmembers);
    console.log("total partitions", totalpartitions);
    tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
    tripdetails.totalspending = tripdetails.petrol + tripdetails.ice + tripdetails.net + tripdetails.food + tripdetails.extra + tripdetails.bata;
    tripdetails.balance = tripdetails.income - tripdetails.totalspending;
    tripdetails.ownerincome = tripdetails.balance * (tripdetails.ownerpercentage/100);
    tripdetails.workerincome = tripdetails.balance * (tripdetails.workerpercentage/100);
    for (var i = 0; i < user.members.length; i++) {
      if(tripdetails.allmembers[user.members[i]._id]) {
        var memberinfo = user.members[i];
        if(tripdetails.workerincome < 0) {
          var salarylevelpercentage = 1 * (100/totalpartitions);
          tripdetails.remainingbalance = (user.members[i].remainingbalance + (tripdetails.workerincome * (salarylevelpercentage/100))).toFixed(2);
        } else {
          var salarylevelpercentage = user.members[i].salarylevel * (100/totalpartitions);
        } 
        memberinfo.total = (tripdetails.workerincome * (salarylevelpercentage/100)).toFixed(2);
        tripdetails.members.push(memberinfo);
      }
    };
    console.log("total days", totalDays);
    console.log('TRIP DETAILS', tripdetails);
    if(MyService.online()) {
      MyService.addTrip(tripdetails).then(function(tripdata) {
        if(tripdata) {
          $state.go('app.tripdashboard', {id:tripdata._id}, {reload:true});
        }
      });
    } else {

    }
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
.controller('ProfileCtrl', function($scope, MyService) {
  $scope.getProfile = function() {
    $scope.user = user;
  }
})
.controller('LogoutCtrl', function($scope,  $stateParams) {
})
.controller('HomeCtrl',function($scope, $state, MyService){
  $scope.user = {
    email: '9988776655',
    password:'904zehfr',
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
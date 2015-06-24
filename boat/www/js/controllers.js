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
.controller('DashboardCtrl', function($scope, $state, $cordovaSQLite, MyService) {
  $scope.getTrips = function() {
    var query = 'SELECT * from trips where boatid = "'+user.boatid+'"';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trips = [];
        for (var i = 0; i < res.rows.length; i++) {
          var row = res.rows[i];
          console.log("row", row);
          trips.push(row);
        };
        console.log("All Trips", trips);
        processVal(trips);
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});

/*    var params = {};
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

    }*/
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
.controller('AllTripsCtrl', function($scope, $state, $cordovaSQLite, MyService) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getTrips = function() {
    var query = 'SELECT * from trips where boatid = "'+user.boatid+'"';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trips = [];
        for (var i = 0; i < res.rows.length; i++) {
          var row = res.rows[i];
          console.log("row", row);
          trips.push(row);
        };
        console.log("All Trips", trips);
        $scope.trips = trips;
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    /*var params = {};
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

    }*/
  }
})
.controller('TripDashboardCtrl', function($scope, $state, $cordovaSQLite, $stateParams, MyService) {
  $scope.getTripData = function() {
    var query = 'SELECT * from trips where id = "'+$stateParams.id+'"';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trip = res.rows.item(0);
        var startdate = new Date(trip.startdate);
        var enddate = new Date(trip.enddate);
        trip.startdate = startdate.getDate() +' '+months[startdate.getMonth()]+' '+startdate.getFullYear();
        trip.enddate = enddate.getDate() +' '+months[enddate.getMonth()]+' '+enddate.getFullYear();
        trip.members = JSON.parse(trip.members);
        trip.extra = JSON.parse(trip.extra);
        console.log("trip dash", trip);
        $scope.trip = trip;
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
    /*if(MyService.online()) {
      MyService.getTrip(params).then(function(trip) {
        console.log("Trips", trip);       
        var startdate = new Date(trip.startdate);
        var enddate = new Date(trip.enddate);
        trip.startdate = startdate.getDate() +' '+months[startdate.getMonth()]+' '+startdate.getFullYear();
        trip.enddate = enddate.getDate() +' '+months[enddate.getMonth()]+' '+enddate.getFullYear();
        $scope.trip = trip;
      }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
    } else {

    }*/
  }
})
.controller('AddtripCtrl', function($scope, $state, $cordovaSQLite, MyService) {
  console.log("current user", user);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerpercentage = user.ownerpercentage;
  addtrip.workerpercentage = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  //default values
  addtrip.income = 90000;
  addtrip.diesel = 100;
  addtrip.ice = 100;
  addtrip.food = 100;
  addtrip.extra = [{name:'Oil',price:200}];
  addtrip.net = 100;
  $scope.addtrip = addtrip;
  $scope.user = user;
  $scope.createExtra = function() {
    console.log("creating new extra");
    $scope.addtrip.extra.push({name:'Belt',price:200});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }

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
    var extra = 0;
    for (var i = 0; i < tripdetails.extra.length; i++) {
      if(tripdetails.extra[i].name) {
        extra += tripdetails.extra[i].price;
      }
    }
    tripdetails.bata = totalmembers * tripdetails.bataperday * totalDays;
    tripdetails.totalspending = tripdetails.diesel + tripdetails.ice + tripdetails.net + tripdetails.food + extra + tripdetails.bata;
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
    //tripdetails.members = JSON.stringify(tripdetails.members).replace(/,/g,'}_');
    //tripdetails.extra = JSON.stringify(tripdetails.extra).replace(/,/g,'}_');
/*    var keys = '';
    var vals = '';
    var values = [];
    for(var tripkey in tripdetails) {
        keys += tripkey + ', ';
        vals += '?,';
        values.push(tripdetails[tripkey]);
    }*/
    //var query = "INSERT into trips ("+keys.substring(0, keys.length - 1)+") VALUES ("+vals.substring(0, vals.length - 1)+")";
    var query = "INSERT into trips (name,boatname,boatid,startdate,enddate,income,diesel,ice,net,food,bata,balance,ownerincome,workerincome,totalspending,extra,members) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    console.log("query", query);
    $cordovaSQLite.execute(db, query, [tripdetails.name,tripdetails.boatname,tripdetails.boatid,tripdetails.startdate,tripdetails.enddate,tripdetails.income,tripdetails.diesel,tripdetails.ice,tripdetails.net,tripdetails.food,tripdetails.bata,tripdetails.balance,tripdetails.ownerincome,tripdetails.workerincome,tripdetails.totalspending, JSON.stringify(tripdetails.extra), JSON.stringify(tripdetails.members)]).then(function(res) {
      console.log("insertId: " + res.insertId);
      $state.go('app.tripdashboard', {id:res.insertId}, {reload:true});
    })
    /*var selectq = 'SELECT key from marks where key = "'+dbkey+'"';
    $cordovaSQLite.execute(db, selectq).then(function(sres) {
      console.log("record count", sres.rows.length);
      if(sres.rows.length == 0) {
        var values = [dbkey, JSON.stringify(studentMarks)];
      }
    })*/
/*    if(MyService.online()) {
      MyService.addTrip(tripdetails).then(function(tripdata) {
        if(tripdata) {
        }
      });
    } else {

    }*/
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
    password:'2pkl0udi',
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
      }, function(err) {
        console.log("user login error", err);
      })
      /*var loggedinuser = localStorage.getItem("loggedinuser") || {};
      if(loggedinuser) {
        var luser = JSON.parse(loggedinuser);
        if((luser.email == $scope.user.email) && (luser.password == $scope.user.password)) {
          localStorage.setItem('uid', user._id);
          $state.go("app.dashboard", {},  {'reload': true});
        }
      } else {
      }*/
    }
    console.log("user details", $scope.user);
  }
})
.controller('LogoutCtrl', function($scope, $http, $state) {
    //delete $http.defaults.headers.common.Authorization;
    console.log("Logging out:");
    localStorage.removeItem('uid');
    $state.go("home", {}, {reload: true});
});
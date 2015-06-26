angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $rootScope, MyService) {
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
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    console.log("from state",toState.name);
    if(toState.name == 'app.dashboard') {
      $rootScope.filters = true;
    } else {
      $rootScope.filters = false;
    }
  })
})
.controller('DashboardCtrl', function($scope, $rootScope, $state, $cordovaSQLite, MyService) {
  $rootScope.filters = true;
  $scope.title = "Overall Dashboard";
  if(localStorage.getItem('filterdata')) {
    filtersData = JSON.parse(localStorage.getItem('filterdata'));
  } else {
    var currentyear = new Date().getFullYear();
    filtersData.years = [currentyear - 1, currentyear];
    filtersData.year = 0;
    filtersData.months = ['All'];
    filtersData.month = 0;
    localStorage.setItem('filtersData', JSON.stringify(filtersData));
  }
  $rootScope.filtersData = filtersData;
  $rootScope.dashboardFilters = function() {
    console.log("filter dashboard data", $rootScope.filtersData);
    $scope.getTrips();
  }
  $scope.getTrips = function() {
    if($rootScope.filtersData.month == 0) {
      var startrange = $rootScope.filtersData.years[$rootScope.filtersData.year] +'-01-01';
      var endrange = $rootScope.filtersData.years[$rootScope.filtersData.year] +'-12-31';
      $scope.title = $rootScope.filtersData.years[$rootScope.filtersData.year] + " Dashboard";
    } else {
      var startrange = $rootScope.filtersData.years[$rootScope.filtersData.year] +'-'+MyService.monthIndex($rootScope.filtersData.months[$rootScope.filtersData.month])+'-01';
      var endrange = $rootScope.filtersData.years[$rootScope.filtersData.year] +'-'+MyService.monthIndex($rootScope.filtersData.months[$rootScope.filtersData.month])+'-31';
      $scope.title = $rootScope.filtersData.years[$rootScope.filtersData.year] + " "+$rootScope.filtersData.months[$rootScope.filtersData.month]+" Dashboard";    
    }
    var query = 'SELECT * from trips where startdate between "'+startrange+'" AND "'+endrange+'" ORDER BY startdate';
    console.log("query", query);
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trips = [];
        for (var i = 0; i < res.rows.length; i++) {
          var row = res.rows[i];
          var start = new Date(row.startdate);
          console.log("month", MyService.months(start.getMonth()));
          if($rootScope.filtersData.months.indexOf(MyService.months(start.getMonth())) == -1) {
           $rootScope.filtersData.months.push(MyService.months(start.getMonth())); 
          }
          if($rootScope.filtersData.years.indexOf(start.getFullYear()) == -1) {
           $rootScope.filtersData.years.push(start.getFullYear()); 
          }
          console.log("rootscope filters", $rootScope.filtersData);
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
      income.push({name:trips[i].name, y:trips[i].income,id:trips[i].id});
      spending.push({name:trips[i].name, y:trips[i].totalspending,id:trips[i].id});
    }
    $scope.incomeConfig = {
      chart: {renderTo: 'income',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Income"},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Income',data: income}]
    }
    $scope.spendingConfig = {
      chart: {renderTo: 'spending',type: 'column', options3d: {enabled: true,alpha: 10,beta: 20,depth: 50}},
      title: {text:"Spending"},plotOptions: {series:{cursor:'pointer',events:{click:function(event){$state.go("app.tripdashboard", {id:event.point.id});}}},column: {depth: 25,showInLegend: false, dataLabels: {enabled: true,format: '{point.y}'}, events: {legendItemClick: function () {return false;}}}},
      xAxis: {categories: incomeLabels},
      yAxis: {title: {text: null}},
      series: [{name: 'Spending',data: spending}]
    }
  }
})
.controller('AllTripsCtrl', function($scope, $state, $cordovaSQLite, MyService) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getTrips = function() {
    var query = 'SELECT * from trips where boatid = "'+user.boatid+'" ORDER BY startdate DESC';
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
  $scope.editTrip = function(id) {
    console.log("editing the trip", $stateParams.id);
    $state.go('app.edittrip', {id:$stateParams.id}, {reload:true});
  }
  $scope.getTripData = function() {
    var query = 'SELECT * from trips where id = "'+$stateParams.id+'"';
    $cordovaSQLite.execute(db, query).then(function(res) {
      totalrecords = res.rows.length;
      if(totalrecords > 0) {
        $scope.dashboardStatus = "not empty";
        var trip = res.rows.item(0);
        var startdate = new Date(trip.startdate);
        var enddate = new Date(trip.enddate);
        trip.startdate = startdate.getDate() +' '+MyService.months(startdate.getMonth())+' '+startdate.getFullYear();
        trip.enddate = enddate.getDate() +' '+MyService.months(enddate.getMonth())+' '+enddate.getFullYear();
        trip.members = JSON.parse(trip.members);
        trip.extra = JSON.parse(trip.extra);
        console.log("trip dash", trip);
        $scope.title = trip.name+" Details";
        $scope.trip = trip;
      } else {$scope.dashboardStatus = "empty";}
    }, function(err) {

    }).finally(function() {$scope.$broadcast('scroll.refreshComplete');});
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
.controller('AddtripCtrl', function($scope, $rootScope, $state, $filter, $ionicSideMenuDelegate, $cordovaSQLite, MyService) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  console.log("current user", user);
  var addtrip = {members:{}};
  addtrip.boatid = user.boatid;
  addtrip.boatname = user.boatname;
  addtrip.ownerp = user.ownerpercentage;
  addtrip.workerp = user.workerpercentage;
  addtrip.bataperday = user.bataperday;
  addtrip.startdate = new Date();
  addtrip.enddate = new Date();
  //default values
/*  addtrip.income = 90000;
  addtrip.diesel = 100;
  addtrip.ice = 100;
  addtrip.food = 100;
  addtrip.net = 100;*/
  addtrip.extra = [{name:'',price:''}];
  $scope.addtrip = addtrip;
  $scope.members = user.members;
  $scope.title = "Add Trip";
  $scope.createExtra = function() {
    console.log("creating new extra");
    $scope.addtrip.extra.push({name:'',price:''});
  }
  $scope.removeExtra = function(index) {
    $scope.addtrip.extra.splice(index, 1);
  }
  $scope.$watch('addtrip.startdate', function(startdate){
    $scope.addtrip.startdateformatted = $filter('date')(startdate, 'yyyy-MM-dd');
  });
  $scope.$watch('addtrip.enddate', function(enddate){
    $scope.addtrip.enddateformatted = $filter('date')(enddate, 'yyyy-MM-dd');
  });
  $scope.submit = function() {
    var tripdetails = $scope.addtrip;
    var err = '';
    if(!tripdetails.income) err += "Please enter income and ";
    if(!tripdetails.allmembers) err += "Please Select members and "
    if(err) {
      err = err.substring(0, err.length - 5);
      alert(err);
    } else {
      var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
      var totalDays = Math.round(Math.abs((tripdetails.startdate.getTime() - tripdetails.enddate.getTime())/(oneDay)));
      tripdetails.members = [];
      var totalmembers = 0;
      var totalpartitions = 0;
      tripdetails.name = tripdetails.startdate.getDate() +' '+MyService.months(tripdetails.startdate.getMonth())+' '+tripdetails.startdate.getFullYear();
      if($rootScope.filtersData.years.indexOf(tripdetails.startdate.getFullYear()) == -1) {
        $rootScope.filtersData.years.push(tripdetails.startdate.getFullYear());
        localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
      }
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
      tripdetails.ownerincome = tripdetails.balance * (tripdetails.ownerp/100);
      tripdetails.workerincome = tripdetails.balance * (tripdetails.workerp/100);
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
      //var query = "INSERT into trips ("+keys.substring(0, keys.length - 1)+") VALUES ("+vals.substring(0, vals.length - 1)+")";
      var query = "INSERT into trips (name,boatname,boatid,startdate,enddate,income,diesel,ice,net,food,bata,balance,ownerincome,workerincome,totalspending,ownerp,workerp,bataperday,extra,members) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      console.log("query", query);
      $cordovaSQLite.execute(db, query, [tripdetails.name,tripdetails.boatname,tripdetails.boatid,tripdetails.startdateformatted,tripdetails.enddateformatted,tripdetails.income,tripdetails.diesel,tripdetails.ice,tripdetails.net,tripdetails.food,tripdetails.bata,tripdetails.balance,tripdetails.ownerincome,tripdetails.workerincome,tripdetails.totalspending, tripdetails.ownerp, tripdetails.workerp, tripdetails.bataperday, JSON.stringify(tripdetails.extra), JSON.stringify(tripdetails.members)]).then(function(res) {
        console.log("insertId: " + res.insertId);
        tripdetails.startdate = tripdetails.startdateformatted;
        tripdetails.enddate = tripdetails.enddateformatted;
        MyService.addTrip(tripdetails).then(function(tripval) {
          $state.go('app.tripdashboard', {id:res.insertId}, {reload:true});
        })
      })
    }
  }
})
.controller('EditTripCtrl', function($scope, $rootScope, $state, $filter, $stateParams, $ionicSideMenuDelegate, $cordovaSQLite, MyService) {
  $ionicSideMenuDelegate.$getByHandle('right-menu').canDragContent(false);
  console.log("edit Trip Controller", $stateParams);
  $scope.members = user.members;
  $scope.$watch('addtrip.startdate', function(startdate){
    $scope.addtrip.startdateformatted = $filter('date')(startdate, 'yyyy-MM-dd');
  });
  $scope.$watch('addtrip.enddate', function(enddate){
    $scope.addtrip.enddateformatted = $filter('date')(enddate, 'yyyy-MM-dd');
  });
  var query = 'SELECT * from trips where id = "'+$stateParams.id+'"';
  $cordovaSQLite.execute(db, query).then(function(res) {
    totalrecords = res.rows.length;
    if(totalrecords > 0) {
      $scope.dashboardStatus = "not empty";
      var trip = res.rows.item(0);
      /*var startdate = new Date(trip.startdate);
      var enddate = new Date(trip.enddate);
      trip.startdate = startdate.getDate() +' '+months[startdate.getMonth()]+' '+startdate.getFullYear();
      trip.enddate = enddate.getDate() +' '+months[enddate.getMonth()]+' '+enddate.getFullYear();
      */
      trip.startdate = new Date(trip.startdate);
      trip.enddate = new Date(trip.enddate);
      trip.members = JSON.parse(trip.members);
      trip.allmembers = [];
      for (var mi = 0; mi < trip.members.length; mi++) {
        trip.allmembers[trip.members[mi]._id] = true;
      };
      trip.extra = JSON.parse(trip.extra);
      console.log("trip details", trip);
      $scope.addtrip = trip;
      $scope.title = "Edit "+ trip.name;
    } else {$scope.dashboardStatus = "empty";}
  }, function(err) {

  }).finally(function() {$scope.$broadcast('scroll.refreshComplete'); $ionicLoading.hide();});
  $scope.submit = function() {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var totalDays = Math.round(Math.abs(($scope.addtrip.startdate.getTime() - $scope.addtrip.enddate.getTime())/(oneDay)));
    var tripdetails = $scope.addtrip;
    var totalmembers = 0;
    var totalpartitions = 0;
    tripdetails.name = tripdetails.startdate.getDate() +' '+MyService.months(tripdetails.startdate.getMonth())+' '+tripdetails.startdate.getFullYear();
/*    if($rootScope.filtersData.years.indexOf(tripdetails.startdate.getFullYear()) == -1) {
      $rootScope.filtersData.years.push(tripdetails.startdate.getFullYear());
      localStorage.setItem("filtersData", JSON.stringify($rootScope.filtersData));
    }*/
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
    tripdetails.ownerincome = tripdetails.balance * (tripdetails.ownerp/100);
    tripdetails.workerincome = tripdetails.balance * (tripdetails.workerp/100);
    tripdetails.updatedmembers = [];
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
        tripdetails.updatedmembers.push(memberinfo);
      }
    };
    tripdetails.members = tripdetails.updatedmembers;
    console.log("trip edit details", tripdetails);
    var query = "UPDATE trips set name = ?, boatname = ?, boatid = ?, startdate = ?, enddate = ?, income = ?, diesel = ?, ice = ?, net = ?, food = ?, bata = ?, balance = ?, ownerincome = ?, workerincome = ?, totalspending = ?, ownerp = ?, workerp = ?, bataperday = ?, extra = ?, members = ? WHERE id = ?";
    console.log("query", query);
    $cordovaSQLite.execute(db, query, [tripdetails.name,tripdetails.boatname,tripdetails.boatid,tripdetails.startdateformatted,tripdetails.enddateformatted,tripdetails.income,tripdetails.diesel,tripdetails.ice,tripdetails.net,tripdetails.food,tripdetails.bata,tripdetails.balance,tripdetails.ownerincome,tripdetails.workerincome,tripdetails.totalspending, tripdetails.ownerp, tripdetails.workerp, tripdetails.bataperday, JSON.stringify(tripdetails.extra), JSON.stringify(tripdetails.members), $stateParams.id]).then(function(res) {
      $state.go('app.tripdashboard', {id:$stateParams.id}, {reload:true});
    })
  }
})
.controller('AllUsersCtrl', function($scope,  $stateParams) {
  $scope.filterToggle = function() {$scope.filterStatus = !$scope.filterStatus;}
  $scope.getUsers = function() {
    $scope.users = user.members;
  }
})
.controller('AddUserCtrl', function($scope, $state) {
  $scope.adduser = {};
  $scope.action = "create";
  $scope.title = "Add User";
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.mobile = uu.email;
    uu.updated = true;
    user.members.push(uu);
    localStorage.setItem("user", JSON.stringify(user));
    $state.go('app.userdashboard', {id:user.members.length - 1}, {reload:true})
    /*var query = "INSERT INTO users (name, role, email, salarylevel) VALUES (?,?,?,?)";
    $cordovaSQLite.execute(db, query, [uu.name,uu.role,uu.email,uu.salarylevel]).then(function(res) {
      console.log("inserted", res.insertId);
    })*/
  }
})
.controller('EditUserCtrl', function($scope, $state, $stateParams, $cordovaSQLite) {
  $scope.roles = ['worker','captain','vice-captain','cook'];
  $scope.adduser = user.members[$stateParams.id];
  $scope.title = "Edit "+ user.members[$stateParams.id].name +" User";
  $scope.defaultSelect = function(val) {
    return ($scope.adduser.role == val) ? true : false;
  }
  $scope.action = "update";
  $scope.submit = function() {
    var uu = $scope.adduser;
    uu.updated = true;
    user.members[$stateParams.id] = uu;
    localStorage.setItem("user", JSON.stringify(user));
    $state.go('app.userdashboard', {id:$stateParams.id}, {reload:true});
  }
})
.controller('UserDashboardCtrl', function($scope, $state, $stateParams) {
  var user = JSON.parse(localStorage.getItem('user'));
  $scope.editUser = function() {
    $state.go('app.edituser',{id:$stateParams.id}, {reload:true});
  }
  $scope.getUserData = function() {
    $scope.member = user.members[$stateParams.id];
    $scope.title = user.members[$stateParams.id].name;
  }
})
.controller('ProfileCtrl', function($scope, MyService) {
  $scope.getProfile = function() {
    $scope.user = user;
  }
})

.controller('HomeCtrl',function($scope, $state, MyService){
  $scope.user = {
    email: '9988776655',
    password:'kb4vx6r'
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
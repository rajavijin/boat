'use strict';

angular.module('boatServerApp')
  .controller('AddDataCtrl', function ($scope,$http,$location) {
    $scope.result = '';
    $scope.ipdata = {};
    $scope.boat = {};
    $scope.boat.boatname = "Kingson";
    $scope.boat.owner = "John/karupan";
    $scope.boat.mobile = 9988776655;
    $scope.boat.ownerpercentage = 60;
    $scope.boat.workerpercentage = 40;
    $scope.boat.betaperday = 200;
	$scope.processing = false;
    $scope.csvImport = function(csvdata) {
    	console.log("csvdata", csvdata);
        if(csvdata && !$scope.processing) {
            $scope.processing = true;
            var updatedResults = [];
            var lastknown = [];
            $scope.updatedItems = [];
            var newdata = csvdata;
            angular.forEach(newdata, function(data, index) {
                var lastknownData = {};
                angular.forEach(data, function(d, i) {
                    var head = i.toLowerCase().split(";");
                    var row = d.split(";");
                    if(row.length > 1) {
                        angular.forEach(row, function(r, k) {
                            lastknownData[head[k]] = r;
                        })
                        lastknownData["import"] = true;
                        lastknownData["email"] = lastknownData["mobile"];
                        lastknown.push(lastknownData);
                    }
                });
            })
            var boatData = $scope.boat;
            console.log("boatData", boatData);
            $http.post('/api/boat', boatData).success(function(boat) {
                console.log("boat", boat);
		        var owner = {};
		        owner.role = "owner";
		        owner.email = boat.mobile;
		        owner.name = boat.owner;
		        owner.import = true;
		        lastknown.push(owner);
                createUser(lastknown, boat, 0);
            }).error(function(err) {
                console.log('error', err);
            });        

        }
    }

    var createUser = function(userData, boatData, i) {
        userData[i].boatname = boatData.boatname;
        userData[i].boatid = boatData._id;
        console.log("userDataSent", userData[i]);
        $http.post('/api/users', userData[i]).success(function(created) {
            i++;
            console.log("total items ", userData.length);
            console.log("iterate ", i);
            if(userData.length > i) {
                createUser(userData, boatData, i);
            }
            if(userData.length == i) {
            	$location.path('/');
            }
        }).error(function(err) {
            console.log('error', err);
     //       $scope.updatedItems.push({Status:error,ID: lastknownData.username, Username: lastknownData.email});
        });
    }
  });

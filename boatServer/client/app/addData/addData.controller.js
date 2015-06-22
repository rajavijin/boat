'use strict';

angular.module('boatServerApp')
  .controller('AddDataCtrl', function ($scope) {
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
                        lastknownData["boat"] = $scope.boat.boatname;
                        lastknownData["email"] = lastknownData["mobile"];
                        lastknown.push(lastknownData);
                    }
                });
            })
            var boatData = $scope.boat;
            var allGrades = boatData.grades.split(",");
            var grades = [];
            console.log("rank", boatData.ranking);
            if(boatData.ranking == 'grade') {
                angular.forEach(allGrades, function(g, gi) {
                    var values = g.split(":");
                    var range = values[1].split("-");
                    grades[gi] = {};
                    grades[gi]["grade"] = values[0];
                    grades[gi]["lesser"] = parseInt(range[0]);
                    grades[gi]["greater"] = parseInt(range[1]);
                });
            } else {
                angular.forEach(allGrades, function(g, gi) {
                    var range = g.split("-");
                    grades[gi] = {};
                    grades[gi]["grade"] = g;
                    grades[gi]["lesser"] = parseInt(range[0]);
                    grades[gi]["greater"] = parseInt(range[1]);
                });
            }
            boatData.grades = grades;
            console.log("boatData", boatData);
            $http.post('/api/boats', boatData).success(function(boat) {
                console.log("boat", boat);
                createUser(lastknown, boat, 0);
            }).error(function(err) {
                console.log('error', err);
            });        

        }
    }

    var createUser = function(userData, boatData, i) {
        userData[i].boatid = boatData._id;
        userData[i].boat = boatData.boat;
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

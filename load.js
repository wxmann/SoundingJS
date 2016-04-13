/**
 * Created by tangz on 4/13/2016.
 */

mainApp.controller('GetSounding', function ($scope, soundingRetriever, soundingData, traceFactory) {
    $scope.getRaob = function () {

        return soundingRetriever.getSounding($scope.inputStation, $scope.inputYear, $scope.inputMonth, $scope.inputDay, $scope.inputHour).then(function (data) {
            $scope.sounding = data;
            $scope.profile = soundingData.profile($scope.sounding);
            $scope.timestamp = soundingData.timestamp($scope.sounding);
            $scope.station = soundingData.station($scope.sounding);
            $scope.testtrace = traceFactory.temperature($scope.profile);
            $scope.test2 = traceFactory.dewpoint($scope.profile);
            $scope.test3= traceFactory.wind($scope.profile);
        })
    };
});

mainApp.factory('soundingRetriever', function ($http, responseConverter, soundingSanitizer) {

    function prependZero(numStr) {
        if (numStr.length == 1) {
            return "0" + numStr;
        }
        return numStr;
    }

    function getTimeStamp(year, month, day, hour) {
        return year + prependZero(month) + prependZero(day) + prependZero(hour) + "00";
    }

    function getURL(station, year, month, day, hour) {
        var host = "http://mesonet.agron.iastate.edu/json/raob.py";
        var url = host + "?ts=" + getTimeStamp(year, month, day, hour) + "&station=" + station + "&callback=JSON_CALLBACK";
        return url;
    }

    return {
        getSounding: function (station, year, month, day, hour) {
            var url = getURL(station, year, month, day, hour);
            return $http.jsonp(url).then(function(response) {
                var rawData = response.data;
                var converted = responseConverter.convert(rawData);
                soundingSanitizer.sanitize(converted);
                return converted;
            });
        }
    };
});

mainApp.factory('soundingSanitizer', function(retrieveFields) {

    function isValidPressure(pres) {
        return pres != null && pres > 0 && pres < 9999;
    }

    function isValidTemp(temp) {
        if (temp != null) {
            return temp < 999 && temp > -999;
        }
        return true;
    }

    return {
        sanitize: function(sounding) {
            sounding.profile = sounding.profile.filter(function(point) {
                return isValidPressure(retrieveFields.pressure(point))
                    && isValidTemp(retrieveFields.temperature(point))
                    && isValidTemp(retrieveFields.dewpoint(point));
            });
        }
    };
});

mainApp.factory('responseConverter', function() {
    return {
        convert: function(rawResponse) {
            var soundingArr = rawResponse.profiles;
            return soundingArr[0];
        }
    };
});

/**
 * Created by tangz on 4/13/2016.
 */

mainApp.factory('traceFactory', function (retrieveFields) {
    return {
        temperature: function(profile) {
            var trace = [];
            angular.forEach(profile, function (point) {
                var pressureVal = retrieveFields.pressure(point);
                var tempVal = retrieveFields.temperature(point);
                if (tempVal != null) {
                    this.push({pres: pressureVal, tmpc: tempVal});
                }
            }, trace);
            return trace;
        },
        dewpoint: function (profile) {
            var trace = [];
            angular.forEach(profile, function (point) {
                var pressureVal = retrieveFields.pressure(point);
                var dewVal = retrieveFields.dewpoint(point);
                if (dewVal != null) {
                    this.push({pres: pressureVal, dwpc: dewVal});
                }
            }, trace);
            return trace;
        },
        wind: function (profile) {
            var trace = [];
            angular.forEach(profile, function (point) {
                var pressureVal = retrieveFields.pressure(point);
                var windDir = retrieveFields.winddirection(point);
                var windSpeed = retrieveFields.windspeed(point);
                if (windDir != null && windSpeed != null) {
                    this.push({pres: pressureVal, sknt: windSpeed, drct: windDir});
                }
            }, trace);
            return trace;
        }
    }
});

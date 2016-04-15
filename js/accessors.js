/**
 * Created by tangz on 4/14/2016.
 */

var properties = function(sounding) {
    return {
        profile: function() {
            return sounding.profile;
        },
        timestamp: function() {
            return sounding.value;
        },
        station: function () {
            return sounding.station;
        }
    };
};

var fields = {
    pressure: function (point) {
        return point.pres;
    },
    temperature: function (point) {
        return point.tmpc;
    },
    dewpoint: function (point) {
        return point.dwpc;
    },
    windspeed: function (point) {
        return point.sknt;
    },
    winddirection: function (point) {
        return point.drct;
    },
    height: function (point) {
        return point.hght;
    }
};

var traces = {
    temperature: function(profile) {
        var trace = {};
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var tempVal = fields.temperature(point);
            if (tempVal != null) {
                trace[pressureVal] = tempVal;
            }
        });
        return trace;
    },
    dewpoint: function (profile) {
        var trace = {};
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var dewVal = fields.dewpoint(point);
            if (dewVal != null) {
                trace[pressureVal] = dewVal;
            }
        });
        return trace;
    },
    wind: function (profile) {
        var trace = {};
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var windDir = fields.winddirection(point);
            var windSpeed = fields.windspeed(point);
            if (windDir != null && windSpeed != null) {
                trace[pressureVal] = {speed: windSpeed, dir: windDir};
            }
        });
        return trace;
    }
};

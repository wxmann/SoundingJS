/**
 * Created by tangz on 4/14/2016.
 */

var properties = function(sounding) {
    return {
        profile: sounding.profile,
        timestamp: sounding.value,
        station: sounding.station
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

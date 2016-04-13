/**
 * Created by tangz on 4/13/2016.
 */

mainApp.factory('retrieveFields', function() {
    return {
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
    }
});

mainApp.factory('soundingData', function () {
    return {
        timestamp: function (sounding) {
            return sounding.valid;
        },
        station: function (sounding) {
            return sounding.station;
        },
        profile: function (sounding) {
            return sounding.profile;
        }
    }
});



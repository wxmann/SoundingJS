/**
 * Created by tangz on 4/14/2016.
 */

var properties = function(sounding) {
    return {
        rawProfile: sounding.profile,
        timestamp: sounding.value,
        station: sounding.station
    };
};

var profileExtract = {
    temperature: function (profile) {
        return profile.filter(function(ob) {
            return ob.hasTemperature();
        }).map(function (ob) {
            return ob.temperature();
        })
    },
    
    dewpoint: function (profile) {
        return profile.filter(function (ob) {
            return ob.hasDewpoint();
        }).map(function (ob) {
            return ob.dewpoint();
        });
    },
    
    wind: function (profile) {
        return profile.filter(function (ob) {
            return ob.hasWind();
        }).map(function (ob) {
            return {
                speed: ob.windSpeed(),
                dir: ob.windDir()
            }
        })
    },

    height: function (profile) {
        return profile.filter(function (ob) {
            return ob.hasHeight();
        }).map(function (ob) {
            return ob.height();
        });
    }
};
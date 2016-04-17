/**
 * Created by tangz on 4/17/2016.
 */

function Trace() {
    this.values = {};
    this.pressures = [];

    this.getValue = function(p) {
        return this.values[p.toString()];
    };

    this.addValue = function(p, val) {
        this.values[p] = val;
        this.pressures.push(p);
        this.pressures.sort(function (a, b) {
            return b-a;
        });
    };
}

var traces = {
    temperature: function(profile) {
        var trace = new Trace();
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var tempVal = fields.temperature(point);
            if (pressureVal != null && tempVal != null) {
                trace.addValue(pressureVal, tempVal);
            }
        });
        return trace;
    },
    dewpoint: function (profile) {
        var trace = new Trace();
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var dewVal = fields.dewpoint(point);
            if (pressureVal != null && dewVal != null) {
                trace.addValue(pressureVal, dewVal);
            }
        });
        return trace;
    },
    wind: function (profile) {
        var trace = new Trace();
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var windDir = fields.winddirection(point);
            var windSpeed = fields.windspeed(point);
            if (pressureVal != null && windDir != null && windSpeed != null) {
                trace.addValue(pressureVal, {speed: windSpeed, dir: windDir});
            }
        });
        return trace;
    }
};
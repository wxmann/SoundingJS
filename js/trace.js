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
        // only insert if pressure value has not already been added.
        if (this.pressures.indexOf(p) < 0) {
            this.values[p] = val;
            this.pressures.push(p);
            this.pressures.sort(function (a, b) {
                return b-a;
            });
        }
    };

    this.sfcPressure = function() {
        // TODO: raise error if plot is empty.
        var i = 0;
        var val = this.getValue(this.pressures[i]);
        while (val == null && i < this.pressures.length) {
            i++;
            val = this.getValue(this.pressures[i]);
        }
        return this.pressures[i];
    };

    this.sfcValue = function() {
        // TODO: raise error if plot is empty.
        var i = 0;
        var val = this.getValue(this.pressures[i]);
        while (val == null && i < this.pressures.length) {
            i++;
            val = this.getValue(this.pressures[i]);
        }
        return val;
    }
}

var traces = function(profile){
    var all = allTraces();

    function allTraces() {
        var trace = new Trace();
        profile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var allvals = point;
            if (pressureVal != null) {
                trace.addValue(pressureVal, allvals);
            }
        });
        return trace;
    }

    function extract(extractionFn) {
        var trace = new Trace();
        all.pressures.forEach(function (p) {
            var val = extractionFn(all.getValue(p));
            if (val != null) {
                trace.addValue(p, val);
            }
        });
        return trace;
    }

    function getSBParcel() {
        var traceTTd = extract(function(point) {
            var T = fields.temperature(point);
            var Td = fields.dewpoint(point);
            if (T == null || Td == null) {
                return null;
            } else {
                return {
                    T: T,
                    Td: Td
                }
            }
        });
        var sfc = {
            p: traceTTd.sfcPressure(),
            T: traceTTd.sfcValue().T,
            Td: traceTTd.sfcValue().Td
        };
        var LCL = lcl(sfc.p, sfc.T, sfc.Td);

        var parcelTrace = new Trace();
        parcelTrace.addValue(sfc.p, sfc.T);
        parcelTrace.addValue(LCL.p, LCL.T);
        var thetaFromSfc = dryAdiabat(sfc.p, sfc.T);
        var thetaEAboveLCL = thetaE(LCL.p, LCL.T);

        // generate trace for points every 25mb
        // do not hit 0mb, I wouldn't doubt some funky behavior there
        for (var p = sfc.p - 25; p >= 25; p -= 25) {
            var parcelTemp;
            if (p > LCL.p) {
                parcelTemp = tempAtDryAdiabat(p, thetaFromSfc);
            } else {
                parcelTemp = tempAtThetaE(p, thetaEAboveLCL);
            }
            parcelTrace.addValue(p, parcelTemp);
        }
        return parcelTrace;
    }

    var parcel = {
        sb: getSBParcel()
    };

    return {
        allFields: all,
        temperature: extract(fields.temperature),
        dewpoint: extract(fields.dewpoint),
        wind: extract(function(point) {
            var windDir = fields.winddirection(point);
            var windSpeed = fields.windspeed(point);
            if (windDir == null || windSpeed == null) {
                return null;
            } else {
                return {
                    speed: windSpeed,
                    dir: windDir
                }
            }
        }),
        parcel: parcel
    }
};
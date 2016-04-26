/**
 * Created by tangz on 4/17/2016.
 */

function Profile() {
    this.values = {};
    this.pressures = [];
}

Profile.prototype.getValue = function(p) {
    return this.values[p.toString()];
};

Profile.prototype.addValue = function(p, val) {
    // only insert if pressure value has not already been added.
    if (this.pressures.indexOf(p) < 0) {
        this.values[p] = val;
        this.pressures.push(p);
        this.pressures.sort(function (a, b) {
            return b-a;
        });
    }
};

/**
 * Merges two profiles into one.
 * @param otherProfile a separate profile
 * @param mergeFn a merge function, which takes one value from each profile, and merges them into a single JS object.
 */
Profile.prototype.merge = function(otherProfile, mergeFn) {
    var newProfile = new Profile();
    var _this = this;
    this.pressures.forEach(function (p) {
        var valThis = _this.getValue(p);
        var valThat = otherProfile.getValue(p);
        if (valThis != null && valThat != null) {
            newProfile.addValue(p, mergeFn(valThis, valThat));
        }
    });
    return newProfile;
};

Profile.prototype.isEmpty = function() {
    return this.pressures.length == 0;
};

/**
 * Predicates filter on -value-, not pressure.
 * @param predicate function that tests value
 */
Profile.prototype.filter = function (predicate) {
    var newProfile = new Profile();
    var _this = this;
    this.pressures.forEach(function (p) {
        var val = _this.getValue(p);
        if (predicate(val)) {
            newProfile.addValue(p, val);
        }
    });
    return newProfile;
};

Profile.prototype.iterator = function () {
    var _this = this;
    var savedIndex = 0;
    var size = this.pressures.length;

    function throwIfComodification() {
        if (_this.pressures.length != size) {
            throw "Internal error: comodification of profile";
        }
    }

    function indexOutOfBounds(i) {
        return i >= size;
    }

    function throwIfInvalidIndex(i) {
        if (i < 0) {
            throw "Internal error, index < 0";
        }
        if (indexOutOfBounds(i)) {
            throw "Internal error, iterator went past bounds: " + i + " > " + size;
        }
    }

    function getFromIndex(i) {
        if (size == 0) {
            return null;
        }
        throwIfComodification();
        throwIfInvalidIndex(i);
        var p = _this.pressures[i];
        return _this.getValue(p);
    }

    return {
        first: function() {
            return getFromIndex(0);
        },

        last: function () {
            return getFromIndex(_this.pressures.length - 1);
        },

        hasNext: function () {
            return !indexOutOfBounds(savedIndex);
        },

        hasPrevious: function () {
            return savedIndex >= 0 && size > 0;
        },

        next: function () {
            var val = getFromIndex(savedIndex);
            savedIndex++;
            return val;
        },

        previous: function () {
            var val = getFromIndex(savedIndex);
            savedIndex--;
            return val;
        },

        resetToFirst: function () {
            savedIndex = 0;
            size = _this.pressures.length;
        },

        resetToLast: function () {
            savedIndex = _this.pressures.length - 1;
            size = _this.pressures.length;
        }
    }
};

///// profiles for a sounding //////

var profiles = function(sounding){
    var allObs = allTraces();

    function allTraces() {
        var trace = new Profile();
        properties(sounding).rawProfile.forEach(function (point) {
            var pressureVal = fields.pressure(point);
            var allvals = point;
            if (pressureVal != null) {
                trace.addValue(pressureVal, allvals);
            }
        });
        return trace;
    }

    function getParcel(sourceOb) {
        var LCL = lcl(sourceOb.p, sourceOb.T, sourceOb.Td);
        var parcelTrace = new Profile();
        parcelTrace.addValue(sourceOb.p, sourceOb.T);
        parcelTrace.addValue(LCL.p, LCL.T);
        var thetaFromSfc = dryAdiabat(sourceOb.p, sourceOb.T);
        var thetaEAboveLCL = thetaE(LCL.p, LCL.T);

        // generate trace for points every 25mb
        // do not hit 0mb, I wouldn't doubt some funky behavior there
        for (var p = sourceOb.p - 25; p >= 25; p -= 25) {
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
        sb: getParcel(parcelSources.surface(allObs))
    };

    return {
        allFields: allObs,
        temperature: extract(allObs, fields.temperature),
        dewpoint: extract(allObs, fields.dewpoint),
        height: extract(allObs, fields.height),
        wind: extract(allObs, function(point) {
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

function extract(allFields, extractionFn) {
    var profile = new Profile();
    allFields.pressures.forEach(function (p) {
        var val = extractionFn(allFields.getValue(p));
        if (val != null) {
            profile.addValue(p, val);
        }
    });
    return profile;
}

var parcelSources = (function () {
    var getSb = function (allFields) {
        var TTdProfile = extract(allFields, function (point) {
            var p = fields.pressure(point);
            var T = fields.temperature(point);
            var Td = fields.dewpoint(point);
            if (p == null || T == null || Td == null) {
                return null;
            } else {
                return {p: p, T: T, Td: Td}
            }
        });
        return TTdProfile.iterator().first();
    };

    return {
        surface: getSb
    }
})();
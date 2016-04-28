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
 * Merges two profiles into one. Points in which one or the other profile has a null value are skipped.
 *
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

/**
 * Returns a profile where the values are mapped using the passed function.
 * @param fn a function that must take the profile value as its argument.
 */
Profile.prototype.apply = function (fn) {
    var newProfile = new Profile();
    var _this = this;
    this.pressures.forEach(function (p) {
        var val = _this.getValue(p);
        newProfile.addValue(p, fn(val));
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
    var prof = new Profile();
    properties(sounding).rawProfile.forEach(function (point) {
        var ob = asOb(point);
        if (ob.hasPressure()) {
            prof.addValue(ob.pressure(), ob);
        }
    });
    return prof;
};
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
Profile.prototype.map = function (fn) {
    var newProfile = new Profile();
    var _this = this;
    this.pressures.forEach(function (p) {
        var val = _this.getValue(p);
        newProfile.addValue(p, fn(val));
    });
    return newProfile;
};

/**
 * Returns the closest elements in allP relative to argument p. Assumes that allP is sorted in descending order.
 * If p > allP[0] or if p < allP[last], return an empty list.
 * If p exactly matches an element in allP, returns an array of one element, p.
 * Else, return an array of the closest elements in allP.
 *
 * @param p
 * @param allP
 * @returns {*}
 */
function searchClosestWithin(p, allP) {
    var len = allP.length;
    if (len == 0) {
        return [];
    } else if (len <= 3) {
        // out of bounds, we can only interpolate within bounds of allP
        if (p > allP[0] || p < allP[len - 1]) {
            return [];
        }
        var pLeftBound = allP[0];
        for (var i = 0; i <= 3; i++) {
            var pCandidate = allP[i];
            if (p == pCandidate) {
                // found exact, we're done
                return [p];
            } else if (pCandidate > p) {
                // we've got to keep going but keep track of the passed element
                pLeftBound = pCandidate;
            } else {
                // found it, we've just passed our target!
                return [pLeftBound, pCandidate];
            }
        }
    } else {
        var pivot = Math.floor(len / 2);
        var val = allP[pivot];
        if (p > val) {
            return searchClosestWithin(p, allP.slice(0, pivot + 1));
        } else if (p < val) {
            return searchClosestWithin(p, allP.slice(pivot, len));
        } else {
            return allP[pivot];
        }
    }
}

Profile.prototype.interp = function(p, interpFn) {
    var closestP = searchClosestWithin(p, this.pressures);
    if (closestP.length == 0) {
        throw "pressure is greater than max pressure or less than min pressure";
    } else if (closestP.length == 1) {
        return this.getValue(p);
    } else {
        var closestPObj = {
            bottom: closestP[0],
            top: closestP[1]
        };
        var closestValObj = {
            bottom: this.getValue(closestP[0]),
            top: this.getValue(closestP[1])
        };
        return interpFn(p, closestPObj, closestValObj);
    }
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
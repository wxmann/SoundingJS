/**
 * Created by tangz on 4/27/2016.
 */

var NODATA = null;

function Ob(p, T, Td, windspd, winddir, hgt) {
    this.p = p;
    this.T = T;
    this.Td = Td;
    this.windspd = windspd;
    this.winddir = winddir;
    this.hgt = hgt;
}

Ob.prototype.pressure = function () {
    return this.p;
};
Ob.prototype.hasPressure = function () {
    return this.p != NODATA;
};
Ob.prototype.temperature = function () {
    return this.T;
};
Ob.prototype.hasTemperature = function () {
    return this.T != NODATA;
};
Ob.prototype.dewpoint = function () {
    return this.Td;
};
Ob.prototype.hasDewpoint = function () {
    return this.Td != NODATA;
};
Ob.prototype.windSpeed = function () {
    return this.windspd;
};
Ob.prototype.windDir = function () {
    return this.winddir;
};
Ob.prototype.hasWind = function () {
    return this.windspd != NODATA && this.winddir != NODATA;
};
Ob.prototype.height = function () {
    return this.hgt;
};
Ob.prototype.hasHeight = function () {
    return this.hgt != NODATA;
};

Ob.prototype.hasSatMixingRatio = function () {
    return this.hasTemperature() && this.hasPressure();
};
Ob.prototype.satMixingRatio = function () {
    if (!this.hasSatMixingRatio()) {
        return NODATA;
    }
    return mixingRatio(this.pressure(), this.temperature());
};

Ob.prototype.hasMixingRatio = function () {
    return this.hasDewpoint() && this.hasPressure();
};

Ob.prototype.mixingRatio = function () {
    return mixingRatio(this.pressure(), this.dewpoint());
};

Ob.prototype.hasVirtualTemp = function () {
    return this.hasMixingRatio() && this.hasTemperature();
};
Ob.prototype.virtualTemp = function () {
    if (!this.hasVirtualTemp()) {
        return NODATA;
    }
    var r = this.mixingRatio();
    return virtualTempAtMixingRatio(this.temperature(), r);
};

var asOb = function (rawProfilePt) {
    var pt = rawProfilePt;
    return new Ob(pt.pres, pt.tmpc, pt.dwpc, pt.sknt, pt.drct, pt.hght);
};

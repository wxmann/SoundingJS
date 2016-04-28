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
    this.noValue = NODATA;
}

Ob.prototype.pressure = function () {
    return this.p;
};
Ob.prototype.hasPressure = function () {
    return this.p != this.noValue;
};
Ob.prototype.temperature = function () {
    return this.T;
};
Ob.prototype.hasTemperature = function () {
    return this.T != this.noValue;
};
Ob.prototype.dewpoint = function () {
    return this.Td;
};
Ob.prototype.hasDewpoint = function () {
    return this.Td != this.noValue;
};
Ob.prototype.windSpeed = function () {
    return this.windspd;
};
Ob.prototype.windDir = function () {
    return this.winddir;
};
Ob.prototype.hasWind = function () {
    return this.windspd != this.noValue && this.winddir != this.noValue;
};
Ob.prototype.height = function () {
    return this.hgt;
};
Ob.prototype.hasHeight = function () {
    return this.hgt != this.noValue;
};

Ob.prototype.hasSatMixingRatio = function () {
    return this.hasTemperature() && this.hasPressure();
};
Ob.prototype.satMixingRatio = function () {
    if (!this.hasSatMixingRatio()) {
        return this.noValue;
    }
    return mixingRatio(this.pressure(), this.temperature());
};

Ob.prototype.hasVirtualTemp = function () {
    return this.hasPressure() && this.hasTemperature() && this.hasDewpoint();
};
Ob.prototype.virtualTemp = function () {
    if (!this.hasVirtualTemp()) {
        return this.noValue;
    }
    var r = mixingRatio(this.pressure(), this.dewpoint());
    return virtualTempAtMixingRatio(this.temperature(), r);
};

var asOb = function (rawProfilePt) {
    var pt = rawProfilePt;
    return new Ob(pt.pres, pt.tmpc, pt.dwpc, pt.sknt, pt.drct, pt.hght);
};

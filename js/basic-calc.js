/**
 * Created by tangz on 4/17/2016.
 */

// Specific gas constant for dry air. Units: J kg-1 K-1
var R_dry = 287.04;

// Constant-pressure heat capacity of dry air at 300K. Units: J kg-1 K-1
var Cp_dry = 1005.7;

// The Poisson constant for dry air, the ratio of the gas constant
// for dry air to the specific heat at constant pressure.
var poissonDry = R_dry / Cp_dry;

// Reference pressure used in adiabatic processes, units: hPa
var pRef = 1000.0;

var satMixingRatio = function(p, T) {
    var es = satVaporPres(T);
    return 621.97 * es / (p - es);
};

/**
 * Saturation vapor pressure in hPa valid for temperature ranges -35C <= T <= 35C.
 * Taken from Bolton (1980).
 *
 * @param T temperature in degrees C.
 * @returns {number}
 */
var satVaporPres = function(T) {
    var arg = 17.67 * T / (T + 243.5);
    return 6.112 * Math.exp(arg);
};

/**
 * LCL temperature (C) from environmental temperature and mixing ratio.
 * @param T the environmental temperature in degrees Celsius.
 * @param r the environmental mixing ratio in g/kg
 * @returns {number}
 */
var lclT_from_r = function(T, r) {
    var Tk = temp_CtoK(T);
    return temp_KtoC(2480 / (3.5 * Math.log(Tk) - Math.log(r) - 4.805) + 55);
};

/**
 * Finds temperature at pressure level given saturation mixing ratio.
 * @param p the pressure level in hPa
 * @param r the mixing ratio in g/kg
 * @returns {number}
 */
var tempAtMixingRatio = function(p, r) {
    var m = r * p / (622 + r);
    var x = 0.0498646455 * log10(m) + 2.4082965;
    var temp = Math.pow(m, 0.0915) - 1.2035;
    var Tk = Math.pow(10, x) - 7.07475 + 38.9114*temp*temp;
    return temp_KtoC(Tk);
};

var temp_CtoK = function(T) {
    return T + 273.15;
};

var temp_KtoC = function(T) {
    return T - 273.15;
};

/**
 * Finds temperature at pressure level given potential temperature theta.
 * @param p the pressure level in hPa
 * @param theta the potential temperature, in Celsius.
 */
var tempAtDryAdiabat = function(p, theta) {
    var thetaK = temp_CtoK(theta);
    var Tk = thetaK * Math.pow(p / pRef, 0.288);
    return temp_KtoC(Tk);
};


function log10(x) {
    return Math.log(x) / Math.log(10);
}



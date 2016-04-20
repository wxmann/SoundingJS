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

/**
 * Mixing ratio in g/kg given pressure and temperature.
 * Taken from Stipanuck (1973).
 *
 * @param p pressure, in hPa
 * @param T temperature, in degrees C
 * @returns {number}
 */
var mixingRatio = function(p, T) {
    var es = satVaporPres(T);
    return 622 * es / (p - es);
};

/**
 * Saturation vapor pressure in hPa valid for temperature ranges -35C <= T <= 35C.
 * Taken from Stipanuck (1973).
 *
 * @param T temperature in degrees C.
 * @returns {number}
 */
var satVaporPres = function(T) {
    var Tk = temp_CtoK(T);
    var a0 = 23.832241 - 5.02808 * log10(Tk);
    var a1 = 1.3816E-7 * Math.pow(10, 11.344 - 0.0303998 * Tk);
    var a2 = 0.0081328 * Math.pow(10, 3.49149 - 1302.8844 / Tk);
    return Math.pow(10, a0 - a1 + a2 - 2949.076 / Tk);
};

var dryAdiabat = function(p, T) {
    var Tk = temp_CtoK(T);
    var theta = Tk * Math.pow(pRef / p, 0.288);
    return temp_KtoC(theta);
};

var moistAdiabat = function(p, T) {
    var Tk = temp_CtoK(T);
    var expArg = -2.6518986 * mixingRatio(p, T) / Tk;
    var thetaS = temp_CtoK(dryAdiabat(p, T)) / Math.exp(expArg);
    return temp_KtoC(thetaS);
};

/**
 * LCL temperature (C) from environmental temperature and mixing ratio.
 *
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
 * Taken from Stipanuck (1973).
 *
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
 * Taken from Stipanuck (1973).
 *
 * @param p the pressure level in hPa
 * @param theta the potential temperature, in Celsius.
 */
var tempAtDryAdiabat = function(p, theta) {
    var thetaK = temp_CtoK(theta);
    var Tk = thetaK * Math.pow(p / pRef, 0.288);
    return temp_KtoC(Tk);
};

var tempAtMoistAdiabat = function(p, thetaw) {
    var thetae = thetaeFromThetaw(thetaw);
    return tempAtThetae(p, thetae);
};

// Bolton 1980
var thetaeFromThetaw = function(thetaw) {
    var es = satVaporPres(thetaw);
    var rs = 622 * es / (1000 - es);
    var thetaw_K = temp_CtoK(thetaw);
    var thetae_K = thetaw_K * Math.exp((3.376 / thetaw_K - 0.00254)* rs * (1+ 0.81E-3 * rs));
    return temp_KtoC(thetae_K);
};

var tempAtThetae = function(p, thetae) {
    var TguessK = 253.16;
    var adjustment = 120;
    var thetaSGuess = temp_CtoK(moistAdiabat(p, temp_KtoC(TguessK)));
    var i = 0;
    var eps = 1E-6;
    var maxIterations = 50;
    var thetaS_K = temp_CtoK(thetae);

    while (i < maxIterations && Math.abs(thetaSGuess - thetaS_K) > eps) {
        adjustment /= 2;
        if (thetaSGuess < thetaS_K) {
            TguessK += adjustment;
        } else {
            TguessK -= adjustment;
        }
        thetaSGuess = temp_CtoK(moistAdiabat(p, temp_KtoC(TguessK)));
        i++;
    }
    return temp_KtoC(TguessK);
    // var tq = 253.16;
    // var d = 120;
    // var a = temp_CtoK(thetaS);
    // for (var i = 0; i < 12; i++) {
    //     d /= 2;
    //     var x = a * Math.exp(-2.6518986 * mixingRatio(p, temp_KtoC(tq)) / tq) - tq * Math.pow(pRef / p, 0.288);
    //     if (Math.abs(x) <= 0.000001) {
    //         break;
    //     } else {
    //         tq += sgn(d, x);
    //     }
    // }
    // return temp_KtoC(tq);
};

// takes the sign of y and applies it to x
function sgn(x, y) {
    if (y < 0) {
        return -Math.abs(x);
    } else {
        return Math.abs(x);
    }
}

function log10(x) {
    return Math.log(x) / Math.log(10);
}



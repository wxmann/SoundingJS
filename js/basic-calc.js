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

var potentialTemp = function(p, T) {
    var Tk = temp_CtoK(T);
    var theta = Tk * Math.pow(pRef / p, poissonDry);
    return temp_KtoC(theta);
};

var thetaE = function(p, T) {
    var Tk = temp_CtoK(T);
    var expArg = -2.6518986 * mixingRatio(p, T) / Tk;
    var thetaS = temp_CtoK(potentialTemp(p, T)) / Math.exp(expArg);
    return temp_KtoC(thetaS);
};

var lcl = function (p, T, Td) {
    var theta = potentialTemp(p, T);  // theta is conserved in dry adiabatic ascent
    var T_LCL = lclT_from_TTd(T, Td);
    return new Ob(presAtDryAdiabat(T_LCL, theta), T_LCL, T_LCL, NODATA, NODATA, NODATA);
};

/**
 * LCL temperature (C) from environmental temperature and dewpoint.
 * Adapted from Bolton (1980) eq. 15.
 *
 * @param T the environmental temperature in degrees Celsius.
 * @param Td the dewpoint temperature in degress Celsius.
 * @returns {number}
 */
var lclT_from_TTd = function(T, Td) {
    var Tk = temp_CtoK(T);
    var Tdk = temp_CtoK(Td);
    var denom = 1/(Tdk - 56) + Math.log(Tk/Tdk)/800;
    return temp_KtoC(1/denom + 56);
};

var presAtDryAdiabat = function(T, theta) {
    var Tk = temp_CtoK(T);
    var theta_K = temp_CtoK(theta);
    return pRef * Math.pow(Tk / theta_K, 1/poissonDry);
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

// var virtualTempAtPres = function (p, T) {
//     var r = mixingRatio(p, T);
//     return virtualTempAtMixingRatio(T, r);
// };

var virtualTempAtMixingRatio = function (T, r) {
    var Tk = temp_CtoK(T);
    var Tvk = Tk * (1+0.61*r);
    return temp_KtoC(Tvk);
};

var temp_CtoK = function(T) {
    return T + 273.15;
};

var temp_KtoC = function(T) {
    return T - 273.15;
};

/**
 * Finds temperature at pressure level given potential temperature theta.
 * Adapted from Bolton (1980).
 *
 * @param p the pressure level in hPa
 * @param theta the potential temperature, in Celsius.
 */
var tempAtDryAdiabat = function(p, theta) {
    var thetaK = temp_CtoK(theta);
    var Tk = thetaK * Math.pow(p / pRef, poissonDry);
    return temp_KtoC(Tk);
};

/**
 * Finds temperature at pressure level for moist adiabat with wet-bulb potential temperature theta-w.
 *
 * @param p pressure level, in hPa
 * @param thetaw the wet-bulb potential temperature for the pseudoadiabat, in Celsius
 */
var tempAtMoistAdiabat = function(p, thetaw) {
    var thetae = thetaE_from_thetaW(thetaw);
    return tempAtThetaE(p, thetae);
};

/**
 * Calculate equivalent potential temperature (theta-e) from wet-bulb potential temperature (theta-w).
 * Taken from Bolton (1980).
 *
 * @param thetaw wet-bulb potential temperature, in Celsius.
 */
var thetaE_from_thetaW = function(thetaw) {
    var es = satVaporPres(thetaw);
    var rs = 622 * es / (1000 - es);
    var thetaw_K = temp_CtoK(thetaw);
    var thetae_K = thetaw_K * Math.exp((3.376 / thetaw_K - 0.00254)* rs * (1+ 0.81E-3 * rs));
    return temp_KtoC(thetae_K);
};

/**
 * Calculate temperature at a given theta-e and pressure level. Iterative algorithm adapted from
 * Stipanuck (1973).
 *
 * @param p pressure level, in hPa
 * @param thetae equivalent potential temperature, in Celsius.
 */
var tempAtThetaE = function(p, thetae) {
    var TguessK = 253.16;
    var adjustment = 120;
    var thetaSGuess = temp_CtoK(thetaE(p, temp_KtoC(TguessK)));
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
        thetaSGuess = temp_CtoK(thetaE(p, temp_KtoC(TguessK)));
        i++;
    }
    return temp_KtoC(TguessK);
};

function log10(x) {
    return Math.log(x) / Math.log(10);
}



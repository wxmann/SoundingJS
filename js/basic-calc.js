/**
 * Created by tangz on 4/17/2016.
 */

// Specific gas constant for dry air. Units: J kg-1 K-1
var R_dry = 287.058;

// Constant-pressure heat capacity of dry air at 300K. Units: J kg-1 K-1
var Cp_dry = 1005;

// The Poisson constant for dry air, the ratio of the gas constant
// for dry air to the specific heat at constant pressure.
var poissonDry = R_dry / Cp_dry;

// Reference pressure used in adiabatic processes, units: hPa
var p_ref = 1000.0;

// mixing ratio passed in as g/kg.
// returns temperature in C.
var mixingRatio_tempC = function(p, mixRat) {
    var termA1 = p/621.97;
    var termA2 = 1/mixRat + 1/621.97;
    var termA2Inv = 1/termA2;
    var vaporP = termA1 * termA2Inv;

    // calculate T from vaporP
    var termB1 = 237.3 / 17.269;
    var termB2 = 1/Math.log(vaporP / 6.11) - 1/17.269;
    var termB2Inv = 1/termB2;
    return termB1 * termB2Inv;
};

var tmp_CtoK = function(T) {
    return T + 273.15;
};

var tmp_KtoC = function(T) {
    return T - 273.15;
};

// potential temperature passed in as C.
// returns temperature in C.
var potentialTemp_tempC = function(p, potentialTmp) {
    var potentialTmp_K = tmp_CtoK(potentialTmp);
    var Tk = potentialTmp_K * Math.pow(p / p_ref, poissonDry);
    return tmp_KtoC(Tk);
};

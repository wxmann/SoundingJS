/**
 * Created by tangz on 4/15/2016.
 */

var baseHeight = 800;
var skewTAspectRatio = 1;
var padding = 20;

var seq = function(minVal, maxVal, delta) {
    var arr = [];
    for (var val = minVal; val <= maxVal; val += delta) {
        arr.push(val);
    }

    return {
        min: minVal,
        max: maxVal,
        values: arr
    }
};

var skewTCanvas = (function() {
    var dimensions = {
        height: baseHeight,
        width: skewTAspectRatio * baseHeight,
        dx: padding,
        dy: padding
    };

    var pSeq = seq(100, 1050, 50),
        tSeq = seq(-100, 40, 10),
        thetaSeq = seq(-30, 160, 10),
        thetaWSeq = seq(-30, 60, 10);

    var plotConfig = {
        // pressure
        isobars: pSeq.values,
        pMin: pSeq.min,
        pMax: pSeq.max,

        // temperature
        isotherms: tSeq.values,
        tMin: tSeq.min,
        tMax: tSeq.max,
        skew: 0.9,

        // mixing ratios
        mixingRatios: [0.4, 1, 2, 4, 7, 10, 16, 24, 32, 40],

        // adiabats
        dryAdiabats: thetaSeq.values,
        thetaMin: thetaSeq.min,
        thetaMax: thetaSeq.max,

        // moist adiabats
        moistAdiabats: thetaWSeq.values,
        thetaWMin: thetaSeq.min,
        thetaWMax: thetaSeq.max
    };

    function pT_Transform(p, T) {
        var pMin = plotConfig.pMin;
        var pMax = plotConfig.pMax;
        var tMin = plotConfig.tMin;
        var tMax = plotConfig.tMax;
        var m = plotConfig.skew;
        var hwRatio = dimensions.height / dimensions.width;

        var relY = Math.log(p / pMin) / Math.log(pMax / pMin);
        var relX = ((T - tMin) / (tMax - tMin)) * (1 + hwRatio) - hwRatio + hwRatio * (1 - relY) / m;
        return {
            relX: relX,
            relY: relY
        }
    }
    return {
        dimensions: dimensions,
        plotConfig: plotConfig,
        transform: function(p, T) {
            var relCoordinates = pT_Transform(p, T);
            return {
                x: relCoordinates.relX * dimensions.width,
                y: relCoordinates.relY * dimensions.height
            }
        }
    }
})();

var windBarbCanvas = (function () {
    var thisWidth = 100;
    var dimensions = {
        height: 1.5 * baseHeight,
        width: thisWidth,
        dx: skewTAspectRatio * baseHeight + padding,
        dy: padding
    };

    var barbLengthBase = 36;
    var barbConfig = {
        barbLength: thisWidth / 2.5,
        longBarbHeight: barbLengthBase / 3,
        shortBarbHeight: barbLengthBase / 6,
        flagWidth: barbLengthBase / 6,
        barbSpacing: barbLengthBase / 8,
        deltaBarb: 3
    };

    return {
        dimensions: dimensions,
        barbConfig: barbConfig
    };
})();
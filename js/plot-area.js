/**
 * Created by tangz on 4/15/2016.
 */

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

var Dimensions = (function () {
    var upperPadding = 40;

    var skewTLabel = {
        width: 50,
        height:50
    };

    var skewTArea = {
        width: 800,
        height: 800
    };

    var skewTWindBarbs = {
        width: 100,
        height: skewTArea.height + skewTLabel.height
    };

    return {
        skewTLabel: skewTLabel,
        skewTArea: skewTArea,
        skewTWindBarbs: skewTWindBarbs,
        upperPadding: upperPadding,

        containerWidth: skewTLabel.width + skewTArea.width + skewTWindBarbs.width,
        containerHeight: Math.max(skewTLabel.height, skewTArea.height, skewTWindBarbs.height) + upperPadding
    }
})();


var SkewTPlotConfig = (function () {
    var pSeq = seq(100, 1050, 50),
        tSeq = seq(-100, 40, 10),
        thetaSeq = seq(-30, 160, 10),
        thetaWSeq = seq(-20, 40, 5);

    var labels = {
        pressures: seq(100, 1000, 100).values,
        temperatures: seq(-40, 40, 10).values,
        padding: 10
    };

    return {
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
        thetaWMax: thetaSeq.max,

        labels: labels
    }
})();

var WindBarbConfig = (function (dim) {
    var barbLengthBase = dim.width / 2.75;
    var barbConfig = {
        barbLength: barbLengthBase,
        longBarbHeight: barbLengthBase / 3,
        shortBarbHeight: barbLengthBase / 6,
        flagWidth: barbLengthBase / 6,
        barbSpacing: barbLengthBase / 8,
        deltaBarb: 3
    };
    return barbConfig;
    
})(Dimensions.skewTWindBarbs);


var Transformer = (function (dim, skewTConfig) {
    function pT_Transform(p, T) {
        var pMin = skewTConfig.pMin;
        var pMax = skewTConfig.pMax;
        var tMin = skewTConfig.tMin;
        var tMax = skewTConfig.tMax;
        var m = skewTConfig.skew;
        var hwRatio = dim.height / dim.width;

        var relY = Math.log(p / pMin) / Math.log(pMax / pMin);
        var relX = ((T - tMin) / (tMax - tMin)) * (1 + hwRatio) - hwRatio + hwRatio * (1 - relY) / m;
        return {
            relX: relX,
            relY: relY
        }
    }

    return {
        toSkewTCoord: function (p, T) {
            var relCoordinates = pT_Transform(p, T);
            return {
                x: relCoordinates.relX * dim.width,
                y: relCoordinates.relY * dim.height
            }
        }
    }
})(Dimensions.skewTArea, SkewTPlotConfig);
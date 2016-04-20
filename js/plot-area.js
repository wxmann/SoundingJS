/**
 * Created by tangz on 4/15/2016.
 */

var baseHeight = 800;
var skewTAspectRatio = 1;
var padding = 20;

var skewTCanvas = (function() {
    var dimensions = {
        height: baseHeight,
        width: skewTAspectRatio * baseHeight,
        dx: padding,
        dy: padding
    };

    var plotConfig = {
        // pressure
        pMin: 100,
        pMax: 1050,
        deltaP: 50,
        // temperature
        tMin: -100,
        tMax: 40,
        deltaT: 10,
        skew: 0.9,
        // mixing ratios
        mixingRatios: [0.4, 1, 2, 4, 7, 10, 16, 24, 32, 40],
        // adiabats
        thetaMin: -30,
        thetaMax: 160,
        deltaTheta: 10,
        deltaPAdiabat: 25
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
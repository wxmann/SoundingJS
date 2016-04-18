/**
 * Created by tangz on 4/15/2016.
 */

var skewTCanvas = (function() {
    var dimensions = {
        height: 800,
        width: 800,
        x: 0,
        y: 0
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
        // dry adiabats
        thetaMin: -30,
        thetaMax: 160,
        deltaTheta: 10,
        deltaPAdiabatPlot: 25
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
                x: relCoordinates.relX * dimensions.width + dimensions.x,
                y: relCoordinates.relY * dimensions.height + dimensions.y
            }
        }
    }
})();
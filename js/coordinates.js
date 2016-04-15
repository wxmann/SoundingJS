/**
 * Created by tangz on 4/15/2016.
 */

var skewTPlot = (function() {
    var skewTDimensions = {
        height: 800,
        width: 800,
        x: 1,
        y: 1
    };

    var skewTConfig = {
        pMin: 100,
        pMax: 1050,
        tMin: -100,
        tMax: 50,
        skew: 1.0
    };

    function pT_Transform(p, T) {
        var pMin = skewTConfig.pMin;
        var pMax = skewTConfig.pMax;
        var tMin = skewTConfig.tMin;
        var tMax = skewTConfig.tMax;
        var m = skewTConfig.skew;
        var hwRatio = skewTDimensions.height / skewTDimensions.width;

        var relY = Math.log(p / pMin) / Math.log(pMax / pMin);
        var relX = ((T - tMin) / (tMax - tMin)) * (1 + hwRatio) - hwRatio + hwRatio * (1 - relY) / m;
        return {
            relX: relX,
            relY: relY
        }
    }
    return {
        transform: function(p, T) {
            var relCoordinates = pT_Transform(p, T);
            return {
                x: relCoordinates.relX * skewTDimensions.width + skewTDimensions.x,
                y: relCoordinates.relY * skewTDimensions.height + skewTDimensions.y
            }
        }
    }
})();
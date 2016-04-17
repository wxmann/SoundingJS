/**
 * Created by tangz on 4/15/2016.
 */

var skewTCanvas = (function() {
    var dimensions = {
        height: 800,
        width: 800,
        x: 1,
        y: 1
    };

    var plotConfig = {
        pMin: 100,
        pMax: 1050,
        tMin: -100,
        tMax: 50,
        skew: 1.0
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
        transform: function(p, T) {
            var relCoordinates = pT_Transform(p, T);
            return {
                x: relCoordinates.relX * dimensions.width + dimensions.x,
                y: relCoordinates.relY * dimensions.height + dimensions.y
            }
        }
    }
})();
/**
 * Created by tangz on 4/15/2016.
 */

var seq = function(minVal, maxVal, delta) {
    var arr = [];
    for (var val = minVal; val <= maxVal; val += delta) {
        arr.push(val);
    }

    // function subSeq(start, until, interval) {
    //     var i = 0;
    //     while (i < arr.length && arr[i++] != start);
    //     if (i >= arr.length) {
    //         return [];
    //     } else {
    //         var k = 0;
    //         var returnedArr = [];
    //         for (var j = i - 1; j < arr.length; j++) {
    //             if (arr[j] > until) {
    //                 break;
    //             }
    //             if (k % interval == 0) {
    //                 returnedArr.push(arr[j]);
    //             }
    //             k++;
    //         }
    //         return returnedArr;
    //     }
    // }

    return {
        min: minVal,
        max: maxVal,
        values: arr,
        // subSeq: subSeq
    }
};

var skewTCanvas = (function() {
    var dimensions = {
        height: 800,
        width: 800,
        dx: 60,
        dy: 40
    };

    var pSeq = seq(100, 1050, 50),
        tSeq = seq(-100, 40, 10),
        thetaSeq = seq(-30, 160, 10),
        thetaWSeq = seq(-20, 40, 5);

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

    var labels = {
        pressures: seq(200, 1000, 100).values,
        temperatures: seq(-40, 40, 10).values,
        padding: 10
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
        },
        labels: labels
    }
})();

var windBarbCanvas = (function () {
    var baseWidth = 100;
    var skewTDim = skewTCanvas.dimensions;
    var dimensions = {
        height: 1.5 * skewTDim.height,
        width: baseWidth,
        dx: skewTDim.width + skewTDim.dx,
        dy: skewTDim.dy
    };

    var barbLengthBase = 36;
    var barbConfig = {
        barbLength: baseWidth / 2.5,
        longBarbHeight: barbLengthBase / 3,
        shortBarbHeight: barbLengthBase / 6,
        flagWidth: barbLengthBase / 6,
        barbSpacing: barbLengthBase / 8,
        deltaBarb: 3
    };

    return {
        dimensions: dimensions,
        barbConfig: barbConfig
    }
})();
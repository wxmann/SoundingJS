/**
 * Created by tangz on 4/17/2016.
 */

var plotTempTrace = function(trace, lineElem) {
    var allpoints = [];
    trace.pressures.forEach(function(pres) {
        var T = trace.getValue(pres);
        var p = Number(pres);
        var coord = skewTCanvas.transform(p, T);
        allpoints.push([coord.x, coord.y].toString());
    });
    lineElem.setAttribute('points', allpoints.join(" "));
};

function getPath(coords) {
    var allpoints = [];
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    coords.forEach(function(coord) {
        allpoints.push([coord.x, coord.y].toString());
    });
    line.setAttribute('points', allpoints.join(" "));
    return line;
}

var plotIsotherms = function(skewT) {
    var isotherms = [];
    for (var temp = skewTCanvas.plotConfig.tMin; temp <= skewTCanvas.plotConfig.tMax; temp += skewTCanvas.plotConfig.deltaT) {
        isotherms.push(temp);
    }
    isotherms.forEach(function(T) {
        var topCoord = skewTCanvas.transform(skewTCanvas.plotConfig.pMin, T);
        var bottomCoord = skewTCanvas.transform(skewTCanvas.plotConfig.pMax, T);
        var path = getPath([topCoord, bottomCoord]);
        skewT.appendChild(path);
        path.setAttribute('style', 'fill:none; stroke:gray; opacity:0.5; stroke-width: 1');
    });
};

var plotPressures = function (skewT) {
    var pressures = [];
    for (var pres = skewTCanvas.plotConfig.pMin; pres <= skewTCanvas.plotConfig.pMax; pres += skewTCanvas.plotConfig.deltaP) {
        pressures.push(pres);
    }
    pressures.forEach(function(p) {
        var leftCoord = skewTCanvas.transform(p, skewTCanvas.plotConfig.tMin);
        var rightCoord = skewTCanvas.transform(p, skewTCanvas.plotConfig.tMax);
        var path = getPath([leftCoord, rightCoord]);
        skewT.appendChild(path);
        path.setAttribute('style', 'fill:none; stroke:gray; opacity:0.7; stroke-width: 1');
    });
};

var plotMixingRatios = function (skewT) {
    var mixingRatios = skewTCanvas.plotConfig.mixingRatios;
    mixingRatios.forEach(function(mixingRatio) {
        var bottomP = skewTCanvas.plotConfig.pMin;
        var bottomT = mixingRatio_tempC(bottomP, mixingRatio);
        var bottomCoord = skewTCanvas.transform(bottomP, bottomT);

        var topP = skewTCanvas.plotConfig.pMax;
        var topT = mixingRatio_tempC(topP, mixingRatio);
        var topCoord = skewTCanvas.transform(topP, topT);

        var path = getPath([bottomCoord, topCoord]);
        skewT.appendChild(path);
        path.setAttribute('style', 'fill:none; stroke:pink; opacity:1; stroke-width: 1');
        path.setAttribute('stroke-dasharray', '10,5')
    });
};

var plotDryAdiabats = function (skewT) {
    var thetas = [];
    for (var theta = skewTCanvas.plotConfig.thetaMin; theta <= skewTCanvas.plotConfig.thetaMax; theta += skewTCanvas.plotConfig.deltaTheta) {
        thetas.push(theta);
    }
    
    var pressurePoints = [];
    for (var p = skewTCanvas.plotConfig.pMin; p <= skewTCanvas.plotConfig.pMax; p += skewTCanvas.plotConfig.deltaPAdiabatPlot) {
        pressurePoints.push(p);
    }

    thetas.forEach(function (theta) {
        var coords = [];
        pressurePoints.forEach(function (p) {
            var T = potentialTemp_tempC(p, theta);
            var coord = skewTCanvas.transform(p, T);
            coords.push(coord);
        });
        var path = getPath(coords);
        path.setAttribute('style', 'fill:none; stroke:orange; opacity:0.75; stroke-width: 1');
        path.setAttribute('stroke-dasharray', '20,10,5,5,5,10');
        skewT.appendChild(path);
    });
};
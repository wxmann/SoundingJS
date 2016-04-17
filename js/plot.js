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

function getLine(coord1, coord2) {
    var allpoints = [];
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    allpoints.push([coord1.x, coord1.y].toString());
    allpoints.push([coord2.x, coord2.y].toString());
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
        var line = getLine(topCoord, bottomCoord);
        skewT.appendChild(line);
        line.setAttribute('style', 'fill:none; stroke:gray; opacity:0.75; stroke-width: 1');
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
        var line = getLine(leftCoord, rightCoord);
        skewT.appendChild(line);
        line.setAttribute('style', 'fill:none; stroke:gray; opacity:0.75; stroke-width: 1');
    });
};
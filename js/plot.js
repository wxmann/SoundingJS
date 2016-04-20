/**
 * Created by tangz on 4/17/2016.
 */

var SVG_NS = 'http://www.w3.org/2000/svg';

var plotSkewTBoundary = function(skewT) {
    var rect = document.createElementNS(SVG_NS, 'rect');
    var dim = skewTCanvas.dimensions;
    rect.setAttribute('style', 'fill:none; stroke:black; stroke-width: 1');
    rect.setAttribute('height', dim.height.toString());
    rect.setAttribute('width', dim.width.toString());
    skewT.appendChild(rect);
};

var plotTempTrace = function(profile, skewT) {
    var trace = traces.temperature(profile);
    var style = "fill:none; stroke:red; stroke-width: 3";
    var id = 'tempTrace';
    var elem = getTraceElement(trace, id, style);
    skewT.appendChild(elem);
};

var plotDewptTrace = function (profile, skewT) {
    var trace = traces.dewpoint(profile);
    var style = "fill:none; stroke:green; stroke-width: 3";
    var id = 'dewptTrace';
    var elem = getTraceElement(trace, id, style);
    skewT.appendChild(elem);
};

function getTraceElement(trace, id, style) {
    var coords = [];
    trace.pressures.forEach(function(pres) {
        var T = trace.getValue(pres);
        var p = Number(pres);
        var coord = skewTCanvas.transform(p, T);
        coords.push(coord);
    });
    var path = getPath(coords);
    path.setAttribute('style', style);
    path.setAttribute('id', id);
    return path;
}

function getPath(coords) {
    var allpoints = [];
    var line = document.createElementNS(SVG_NS, 'polyline');
    coords.forEach(function(coord) {
        allpoints.push([coord.x, coord.y].toString());
    });
    line.setAttribute('points', allpoints.join(" "));
    return line;
}

function createGroupElement(id, style) {
    var groupElem = document.createElementNS(SVG_NS, 'g');
    groupElem.id = id;
    groupElem.style = style;
    return groupElem;
}

var plotIsotherms = function(skewT) {
    var isotherms = [];
    for (var temp = skewTCanvas.plotConfig.tMin; temp <= skewTCanvas.plotConfig.tMax; temp += skewTCanvas.plotConfig.deltaT) {
        isotherms.push(temp);
    }
    var g = createGroupElement('isotherms', 'fill:none; stroke:gray; opacity:0.7; stroke-width: 1');
    skewT.appendChild(g);

    isotherms.forEach(function(T) {
        var topCoord = skewTCanvas.transform(skewTCanvas.plotConfig.pMin, T);
        var bottomCoord = skewTCanvas.transform(skewTCanvas.plotConfig.pMax, T);
        var path = getPath([topCoord, bottomCoord]);
        g.appendChild(path);
    });
};

var plotPressures = function (skewT) {
    var pressures = [];
    for (var pres = skewTCanvas.plotConfig.pMin; pres <= skewTCanvas.plotConfig.pMax; pres += skewTCanvas.plotConfig.deltaP) {
        pressures.push(pres);
    }
    var g = createGroupElement('pressures', 'fill:none; stroke:gray; opacity:0.7; stroke-width: 1');
    skewT.appendChild(g);

    pressures.forEach(function(p) {
        var leftCoord = skewTCanvas.transform(p, skewTCanvas.plotConfig.tMin);
        var rightCoord = skewTCanvas.transform(p, skewTCanvas.plotConfig.tMax);
        var path = getPath([leftCoord, rightCoord]);
        g.appendChild(path);
    });
};

var plotMixingRatios = function (skewT) {
    var mixingRatios = skewTCanvas.plotConfig.mixingRatios;
    var g = createGroupElement('mixingRatios', 'fill:none; stroke:pink; opacity:1; stroke-width: 1.2; stroke-dasharray: 10,5');
    skewT.appendChild(g);

    mixingRatios.forEach(function(mixingRatio) {
        var bottomP = skewTCanvas.plotConfig.pMin;
        var bottomT = tempAtMixingRatio(bottomP, mixingRatio);
        var bottomCoord = skewTCanvas.transform(bottomP, bottomT);

        var topP = skewTCanvas.plotConfig.pMax;
        var topT = tempAtMixingRatio(topP, mixingRatio);
        var topCoord = skewTCanvas.transform(topP, topT);

        var path = getPath([bottomCoord, topCoord]);
        g.appendChild(path);
    });
};

var plotDryAdiabats = function (skewT) {
    var thetas = [];
    for (var theta = skewTCanvas.plotConfig.thetaMin; theta <= skewTCanvas.plotConfig.thetaMax; theta += skewTCanvas.plotConfig.deltaTheta) {
        thetas.push(theta);
    }
    var pressurePoints = [];
    for (var p = skewTCanvas.plotConfig.pMin; p <= skewTCanvas.plotConfig.pMax; p += skewTCanvas.plotConfig.deltaPDryAdiabat) {
        pressurePoints.push(p);
    }
    var g = createGroupElement('dryAdiabats', 'fill:none; stroke:orange; opacity:0.8; stroke-width: 1; stroke-dasharray: 20,10,5,5,5,10');
    skewT.appendChild(g);

    thetas.forEach(function (theta) {
        var coords = [];
        pressurePoints.forEach(function (p) {
            var T = tempAtDryAdiabat(p, theta);
            var coord = skewTCanvas.transform(p, T);
            coords.push(coord);
        });
        var path = getPath(coords);
        g.appendChild(path);
    });
};

var plotMoistAdiabats = function (skewT) {
    var g = createGroupElement('moistAdiabats', 'fill:none; stroke:green; opacity:0.5; stroke-width: 1; stroke-dasharray: 20,10,5,5,5,10');
    skewT.appendChild(g);

    var hiP = skewTCanvas.plotConfig.pMax;
    var lowP = skewTCanvas.plotConfig.pMin;
    var dp = skewTCanvas.plotConfig.deltaPDryAdiabat;

    var thetaWs = [];
    for (var thetaW = skewTCanvas.plotConfig.thetaWMin; thetaW <= skewTCanvas.plotConfig.thetaWMax; thetaW += skewTCanvas.plotConfig.deltaThetaW) {
        thetaWs.push(thetaW);
    }
    thetaWs.forEach(function (thetaW) {
        var moistAdiab = getMoistAdiabat(thetaW, hiP, lowP, dp);
        g.appendChild(moistAdiab);
    });
};

function getMoistAdiabat(thetaW, hiP, lowP, dp) {
    var coords = [];
    for (var p = hiP; p >= lowP; p -= dp) {
        var T = tempAtMoistAdiabat(p, thetaW);
        coords.push(skewTCanvas.transform(p, T));
    }
    return getPath(coords);
}

function getWindBarb(windspd, winddir, coord) {
    var mainBarb = document.createElementNS(SVG_NS, 'path');
    var parts = [];
    parts.push(["M", coord.x, coord.y].join(" "));
    // wind barb properties
    var barbLength = windBarbCanvas.barbConfig.barbLength;
    var longBarbHeight = windBarbCanvas.barbConfig.longBarbHeight;
    var shortBarbHeight = windBarbCanvas.barbConfig.shortBarbHeight;
    var flagWidth = windBarbCanvas.barbConfig.flagWidth;
    var barbSpacing = windBarbCanvas.barbConfig.barbSpacing;

    // draw barb to point north initially
    var barbEndCoord = {x: coord.x, y: coord.y - barbLength};
    parts.push(["L", barbEndCoord.x, barbEndCoord.y].join(" "));
    var currentPosition = barbEndCoord;
    mainBarb.style.fill = 'none';   // related to filling in the flags. Don't fill initially
    var left = windspd;

    // draw the 50kt barbs, if applicable
    while (left >= 50) {
        var triApex = {x: barbEndCoord.x + longBarbHeight, y: barbEndCoord.y + (flagWidth / 2)};
        var triEnd = {x: barbEndCoord.x, y: barbEndCoord.y + flagWidth};
        parts.push(["L", triApex.x, triApex.y].join(" "));
        parts.push(["L", triEnd.x, triEnd.y].join(" "));
        currentPosition.y += (barbSpacing + flagWidth);
        parts.push(["M", currentPosition.x, currentPosition.y].join(" "));

        // do fill in flags if they exist.
        mainBarb.style.fill = 'black';
        left -= 50;
    }

    // draw the 10kt barbs, if applicable
    while (left >= 10) {
        var barbApex = {x: currentPosition.x + longBarbHeight, y: currentPosition.y};
        parts.push(["L", barbApex.x, barbApex.y].join(" "));
        currentPosition.y += barbSpacing;
        parts.push(["M", currentPosition.x, currentPosition.y].join(" "));
        left -= 10;
    }

    // draw the 5kt barbs, if applicable
    while (left >= 5) {
        var barbApex = {x: currentPosition.x + shortBarbHeight, y: currentPosition.y};
        parts.push(["L", barbApex.x, barbApex.y].join(" "));
        currentPosition.y += barbSpacing;
        parts.push(["M", currentPosition.x, currentPosition.y].join(" "));
        left -= 5;
    }

    mainBarb.setAttribute('d', parts.join(" "));

    // incorporate wind dir and rotation
    mainBarb.setAttribute('transform', 'rotate(' + [winddir, coord.x, coord.y].join(" ") + ')');
    return mainBarb;
}

var plotWindBarbs = function (profile, windBarbLiner) {
    var trace = traces.wind(profile);
    var i = 0;
    var g = createGroupElement('windBarbs', 'stroke:black; opacity:1; stroke-width: 1');
    windBarbLiner.appendChild(g);

    trace.pressures.forEach(function (p) {
        if (i % windBarbCanvas.barbConfig.deltaBarb == 0) {
            var wind = trace.getValue(p);
            var yCoord = skewTCanvas.transform(p, 0).y;
            var xCoord = windBarbCanvas.dimensions.width / 2;
            var barb = getWindBarb(wind.speed, wind.dir, {x: xCoord, y: yCoord});
            g.appendChild(barb);
        }
        i++;
    });
};
/**
 * Created by tangz on 4/17/2016.
 */

var SVG_NS = 'http://www.w3.org/2000/svg';

var Elements = {
    SKEW_T_BOUNDARY: "skewTBoundary",
    TEMP_TRACE: "tempTrace",
    DEWPT_TRACE: "dewptTrace",
    SB_PARCEL_TRACE: "sbParcelTrace",
    ISOTHERMS: "isotherms",
    ISOBARS: "isobars",
    MIXING_RATIOS: "mixingRatios",
    DRY_ADIABATS: "dryAdiabats",
    MOIST_ADIABATS: "moistAdiabats",
    WIND_BARBS: "windBarbs",
    ISOBAR_LABELS: "pLabels",
    ISOTHERM_LABELS: "tLables"
};

var SkewTPlotter = (function (dim, skewTConfig, windBarbConfig, transform) {
    var plotSkewTBoundary = function(skewT) {
        var rect = document.createElementNS(SVG_NS, 'rect');
        rect.id = Elements.SKEW_T_BOUNDARY;
        rect.setAttribute('height', dim.skewTArea.height.toString());
        rect.setAttribute('width', dim.skewTArea.width.toString());
        skewT.appendChild(rect);
    };

    var plotTempTrace = function(skewT) {
        var trace = saved.soundingTraces().temperature;
        var elem = getTraceElement(trace, Elements.TEMP_TRACE);
        skewT.appendChild(elem);
    };

    var plotDewptTrace = function (skewT) {
        var trace = saved.soundingTraces().dewpoint;
        var elem = getTraceElement(trace, Elements.DEWPT_TRACE);
        skewT.appendChild(elem);
    };

    function getTraceElement(trace, id) {
        var g = createGroupElement(id);
        var coords = [];
        trace.pressures.forEach(function(pres) {
            var T = trace.getValue(pres);
            var p = Number(pres);
            var coord = transform.toSkewTCoord(p, T);
            coords.push(coord);

            var circ = document.createElementNS(SVG_NS, 'circle');
            circ.setAttribute('cx', coord.x.toString());
            circ.setAttribute('cy', coord.y.toString());
            circ.setAttribute('r', '3');
            circ.style.opacity = '0';
            g.appendChild(circ);
        });
        var path = getPath(coords);
        g.appendChild(path);
        return g;
    }

    function getPath(coords) {
        var allpoints = [];
        var line = document.createElementNS(SVG_NS, 'polyline');
        coords.forEach(function(coord) {
            allpoints.push([coord.x, coord.y].toString());
        });
        line.setAttribute('points', allpoints.join(" "));
        line.style.fill = 'none';
        return line;
    }

    function createGroupElement(id) {
        var groupElem = document.createElementNS(SVG_NS, 'g');
        groupElem.id = id;
        return groupElem;
    }

    var plotIsotherms = function(skewT) {
        var g = createGroupElement(Elements.ISOTHERMS);
        skewT.appendChild(g);

        skewTConfig.isotherms.forEach(function(T) {
            var topCoord = transform.toSkewTCoord(skewTConfig.pMin, T);
            var bottomCoord = transform.toSkewTCoord(skewTConfig.pMax, T);
            var path = getPath([topCoord, bottomCoord]);
            g.appendChild(path);
        });
    };

    var plotPressures = function (skewT) {
        var g = createGroupElement(Elements.ISOBARS);
        skewT.appendChild(g);

        skewTConfig.isobars.forEach(function(p) {
            var leftCoord = transform.toSkewTCoord(p, skewTConfig.tMin);
            var rightCoord = transform.toSkewTCoord(p, skewTConfig.tMax);
            var path = getPath([leftCoord, rightCoord]);
            g.appendChild(path);
        });
    };

    var plotMixingRatios = function (skewT) {
        var g = createGroupElement(Elements.MIXING_RATIOS);
        skewT.appendChild(g);

        skewTConfig.mixingRatios.forEach(function(mixingRatio) {
            var bottomP = skewTConfig.pMin;
            var bottomT = tempAtMixingRatio(bottomP, mixingRatio);
            var bottomCoord = transform.toSkewTCoord(bottomP, bottomT);

            var topP = skewTConfig.pMax;
            var topT = tempAtMixingRatio(topP, mixingRatio);
            var topCoord = transform.toSkewTCoord(topP, topT);

            var path = getPath([bottomCoord, topCoord]);
            g.appendChild(path);
        });
    };

    var plotDryAdiabats = function (skewT) {
        var g = createGroupElement(Elements.DRY_ADIABATS);
        skewT.appendChild(g);

        skewTConfig.dryAdiabats.forEach(function (theta) {
            var dryAdiabat = getDryAdiabat(theta, skewTConfig.pMax, skewTConfig.pMin, 25);
            g.appendChild(dryAdiabat);
        });
    };

    function getDryAdiabat(theta, hiP, lowP, dp) {
        var coords = [];
        for (var p = hiP; p >= lowP; p -= dp) {
            var T = tempAtDryAdiabat(p, theta);
            coords.push(transform.toSkewTCoord(p, T));
        }
        return getPath(coords);
    }

    var plotMoistAdiabats = function (skewT) {
        var g = createGroupElement(Elements.MOIST_ADIABATS);
        skewT.appendChild(g);

        skewTConfig.moistAdiabats.forEach(function (thetaW) {
            var moistAdiab = getMoistAdiabat(thetaW, skewTConfig.pMax, skewTConfig.pMin, 25);
            g.appendChild(moistAdiab);
        });
    };

    function getMoistAdiabat(thetaW, hiP, lowP, dp) {
        var coords = [];
        for (var p = hiP; p >= lowP; p -= dp) {
            var T = tempAtMoistAdiabat(p, thetaW);
            coords.push(transform.toSkewTCoord(p, T));
        }
        return getPath(coords);
    }

    function getWindBarb(windspd, winddir, coord) {
        var mainBarb = document.createElementNS(SVG_NS, 'path');
        var parts = [];
        parts.push(["M", coord.x, coord.y].join(" "));
        // wind barb properties
        var barbLength = windBarbConfig.barbLength;
        var longBarbHeight = windBarbConfig.longBarbHeight;
        var shortBarbHeight = windBarbConfig.shortBarbHeight;
        var flagWidth = windBarbConfig.flagWidth;
        var barbSpacing = windBarbConfig.barbSpacing;

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

    var plotWindBarbs = function (windBarbLiner) {
        var trace = saved.soundingTraces().wind;
        var i = 0;
        var g = createGroupElement(Elements.WIND_BARBS);
        windBarbLiner.appendChild(g);

        trace.pressures.forEach(function (p) {
            if (i % windBarbConfig.deltaBarb == 0) {
                var wind = trace.getValue(p);
                var yCoord = transform.toSkewTCoord(p, 0).y;
                var xCoord = dim.skewTWindBarbs.width / 2;
                var barb = getWindBarb(wind.speed, wind.dir, {x: xCoord, y: yCoord});
                g.appendChild(barb);
            }
            i++;
        });
    };

    var plotSBParcel = function (skewT) {
        var trace = saved.soundingTraces().parcel.sb;
        var elem = getTraceElement(trace, Elements.SB_PARCEL_TRACE);
        skewT.appendChild(elem);
    };

    var plotPressureLabels = function(labelCanvas) {
        var g = createGroupElement(Elements.ISOBAR_LABELS);
        g.setAttribute('transform', 'translate(-10,0)');
        g.setAttribute('text-anchor', 'end');
        labelCanvas.appendChild(g);

        var dy = dim.upperPadding;

        skewTConfig.labels.pressures.forEach(function (p) {
            var y = transform.toSkewTCoord(p, 0).y + dy;
            var x = dim.skewTLabel.width;
            var textElem = getTextElement(p, x, y);
            textElem.setAttribute('alignment-baseline', 'middle');
            g.appendChild(textElem);
        });
    };

    var plotTempLabels = function(labelCanvas) {
        var g = createGroupElement(Elements.ISOTHERM_LABELS);
        g.setAttribute('transform', 'translate(0,20)');
        g.setAttribute('text-anchor', 'middle');
        labelCanvas.appendChild(g);

        var dy = dim.upperPadding;

        skewTConfig.labels.temperatures.forEach(function (T) {
            var maxP = skewTConfig.pMax;
            var coords = transform.toSkewTCoord(maxP, T);
            var y = coords.y + dy;
            var x = coords.x + dim.skewTLabel.width;
            var textElem = getTextElement(T, x, y);
            g.appendChild(textElem);
        });
    };

    function getTextElement(level, x, y) {
        var textElem = document.createElementNS(SVG_NS, 'text');
        textElem.innerHTML = level.toString();
        textElem.setAttribute('x', x.toString());
        textElem.setAttribute('y', y.toString());
        return textElem;
    }

    return {
        plotSkewTLabels: function (labelCanvas) {
            var realWidth = dim.skewTLabel.width + dim.skewTArea.width + dim.skewTWindBarbs.width;
            var realHght = dim.skewTLabel.height + dim.upperPadding + dim.skewTArea.height;
            labelCanvas.setAttribute('width', realWidth.toString());
            labelCanvas.setAttribute('height', realHght.toString());
            plotPressureLabels(labelCanvas);
            plotTempLabels(labelCanvas);
        },

        plotSkewTOutline: function (skewTCanvas) {
            skewTCanvas.setAttribute('x', dim.skewTLabel.width.toString());
            skewTCanvas.setAttribute('y', dim.upperPadding.toString());
            skewTCanvas.setAttribute('width', dim.skewTArea.width.toString());
            skewTCanvas.setAttribute('height', dim.skewTArea.height.toString());
            plotSkewTBoundary(skewTCanvas);
            plotPressures(skewTCanvas);
            plotIsotherms(skewTCanvas);
            plotDryAdiabats(skewTCanvas);
            plotMoistAdiabats(skewTCanvas);
            plotMixingRatios(skewTCanvas);
        },

        plotWindBarbs: function(windBarbCanvas) {
            var positionX = dim.skewTLabel.width + dim.skewTArea.width;
            windBarbCanvas.setAttribute('x', positionX.toString());
            windBarbCanvas.setAttribute('y', dim.upperPadding.toString());
            windBarbCanvas.setAttribute('width', dim.skewTWindBarbs.width.toString());
            windBarbCanvas.setAttribute('height', dim.skewTWindBarbs.height.toString());
            plotWindBarbs(windBarbCanvas);
        },

        plotSoundingData: function (skewTCanvas) {
            plotTempTrace(skewTCanvas);
            plotDewptTrace(skewTCanvas);
            plotSBParcel(skewTCanvas);
        }
    }
    
})(Dimensions, SkewTPlotConfig, WindBarbConfig, Transformer);




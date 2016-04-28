/**
 * Created by tangz on 4/28/2016.
 */

/**
 * Created by tangz on 4/17/2016.
 */

var SkewTBackground = (function (dim, skewTConfig, transform) {
    var plotSkewTBoundary = function(skewT) {
        var rect = createBoundaryRect(Elements.SKEW_T_BOUNDARY, dim.skewTArea.height, dim.skewTArea.width);
        skewT.appendChild(rect);
    };

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

    var plotPressureLabels = function(labelCanvas) {
        var g = createGroupElement(Elements.ISOBAR_LABELS);
        translate(g, -10, 0);
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
        translate(g, 0, 20);
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
            var realWidth = dim.skewTLabel.x + dim.skewTLabel.width + dim.skewTArea.width + dim.skewTWindBarbs.width;
            var realHght = dim.skewTLabel.y + dim.skewTLabel.height + dim.upperPadding + dim.skewTArea.height;
            var labelDim = {
                x: dim.skewTLabel.x,
                y: dim.skewTLabel.y,
                width: realWidth,
                height: realHght
            };
            setDimensions(labelCanvas, labelDim);

            plotPressureLabels(labelCanvas);
            plotTempLabels(labelCanvas);
        },

        plotSkewTOutline: function (skewTCanvas) {
            setDimensions(skewTCanvas, dim.skewTArea);
            plotSkewTBoundary(skewTCanvas);
            plotPressures(skewTCanvas);
            plotIsotherms(skewTCanvas);
            plotDryAdiabats(skewTCanvas);
            plotMoistAdiabats(skewTCanvas);
            plotMixingRatios(skewTCanvas);
        }
    }

})(Dimensions, SkewTPlotConfig, Transformer);





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
    ISOTHERM_LABELS: "tLables",
    
    HODO_BOUNDARY: "hodographBoundary",
    WINDSPEED_RADII: "windRadii",
    HODO_AXES: "hodoAxes",
    HODO_TRACE: "hodoTrace",

    classes: {
        BOUNDARY: "bdy",
        TRACE: "trace",
        KM_0_3: "km_0_3",
        KM_3_6: "km_3_6",
        KM_6_9: "km_6_9",
        KM_gt_9: "km_gt_9"
    }
};

function createBoundaryRect(id, hgt, width) {
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.id = id;
    rect.setAttribute('class', Elements.classes.BOUNDARY);
    rect.setAttribute('height', hgt.toString());
    rect.setAttribute('width', width.toString());
    return rect;
}

function createGroupElement(id) {
    var groupElem = document.createElementNS(SVG_NS, 'g');
    groupElem.id = id;
    return groupElem;
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

function addTranslation(elem, dx, dy) {
    elem.setAttribute('transform', 'translate(' + [dx, dy].toString() + ')');
}

function getTraceElement(profile, id, getCoordAtP) {
    var g = createGroupElement(id);
    if (!profile.isEmpty()) {
        g.setAttribute('class', Elements.classes.TRACE);
        var coords = [];
        profile.pressures.forEach(function (pres) {
            var coord = getCoordAtP(pres);
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
    }
    return g;
}

var SkewTPlotter = (function (dim, skewTConfig, windBarbConfig, transform) {
    var plotSkewTBoundary = function(skewT) {
        var rect = createBoundaryRect(Elements.SKEW_T_BOUNDARY, dim.skewTArea.height, dim.skewTArea.width);
        skewT.appendChild(rect);
    };

    function getCoordFromProfile(profile) {
        var getCoordFromPres = function (pres) {
            var T = profile.getValue(pres);
            var p = Number(pres);
            var coord = transform.toSkewTCoord(p, T);
            return coord;
        };
        return getCoordFromPres;
    }

    var plotTempTrace = function(skewT) {
        var profile = saved.soundingProfiles().temperature;
        var elem = getTraceElement(profile, Elements.TEMP_TRACE, getCoordFromProfile(profile));
        skewT.appendChild(elem);
    };

    var plotDewptTrace = function (skewT) {
        var profile = saved.soundingProfiles().dewpoint;
        var elem = getTraceElement(profile, Elements.DEWPT_TRACE, getCoordFromProfile(profile));
        skewT.appendChild(elem);
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
        var windProfile = saved.soundingProfiles().wind;
        var i = 0;
        var g = createGroupElement(Elements.WIND_BARBS);
        windBarbLiner.appendChild(g);

        windProfile.pressures.forEach(function (p) {
            if (i % windBarbConfig.deltaBarb == 0) {
                var wind = windProfile.getValue(p);
                var yCoord = transform.toSkewTCoord(p, 0).y;
                var xCoord = dim.skewTWindBarbs.width / 2;
                var barb = getWindBarb(wind.speed, wind.dir, {x: xCoord, y: yCoord});
                g.appendChild(barb);
            }
            i++;
        });
    };

    var plotSBParcel = function (skewT) {
        var parcelProfile = saved.soundingProfiles().parcel.sb;
        var elem = getTraceElement(parcelProfile, Elements.SB_PARCEL_TRACE, getCoordFromProfile(parcelProfile));
        skewT.appendChild(elem);
    };

    var plotPressureLabels = function(labelCanvas) {
        var g = createGroupElement(Elements.ISOBAR_LABELS);
        addTranslation(g, -10, 0);
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
        addTranslation(g, 0, 20);
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
            labelCanvas.setAttribute('width', realWidth.toString());
            labelCanvas.setAttribute('height', realHght.toString());
            labelCanvas.setAttribute('x', dim.skewTLabel.x.toString());
            labelCanvas.setAttribute('y', dim.skewTLabel.y.toString());
            plotPressureLabels(labelCanvas);
            plotTempLabels(labelCanvas);
        },

        plotSkewTOutline: function (skewTCanvas) {
            skewTCanvas.setAttribute('x', dim.skewTArea.x.toString());
            skewTCanvas.setAttribute('y', dim.skewTArea.y.toString());
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
            windBarbCanvas.setAttribute('x', dim.skewTWindBarbs.x.toString());
            windBarbCanvas.setAttribute('y', dim.skewTWindBarbs.y.toString());
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


var HodographPlotter = (function (dim, hodoConfig, transform) {
    var cx = dim.hodographArea.width / 2;
    var cy = dim.hodographArea.height / 2;

    var plotHodographBoundary = function (hodog) {
        var rect = createBoundaryRect(Elements.HODO_BOUNDARY, dim.hodographArea.height, dim.hodographArea.width);
        hodog.appendChild(rect);
    };

    function translateToCenter(elem) {
        addTranslation(elem, cx, cy);
    }
    
    var plotHodographRadii = function (hodog) {
        // may have to move this to plot-config
        var rMax = Math.sqrt(cx*cx + cy*cy);

        var hodoRadii = createGroupElement(Elements.WINDSPEED_RADII);
        translateToCenter(hodoRadii);
        hodog.appendChild(hodoRadii);

        hodoConfig.radii.forEach(function (v) {
            var r = rMax * v / hodoConfig.vMax;
            var circ = document.createElementNS(SVG_NS, 'circle');
            circ.setAttribute('cx', '0');
            circ.setAttribute('cy', '0');
            circ.setAttribute('r', r);
            hodoRadii.appendChild(circ);
        });
    };

    var plotHodographAxes = function (hodog) {
        var g = createGroupElement(Elements.HODO_AXES);
        hodog.appendChild(g);
        translateToCenter(g);

        var yAxisPts = [
            {x:0, y:cy}, {x:0, y:-cy}
        ];
        var xAxisPts = [
            {x:-cx, y:0}, {x:cx, y:0}
        ];
        var yAxis = getPath(yAxisPts);
        var xAxis = getPath(xAxisPts);
        g.appendChild(yAxis);
        g.appendChild(xAxis);
    };

    var plotWindTrace = function(hodog) {
        var windProfile = saved.soundingProfiles().wind;
        var hghtProfile = saved.soundingProfiles().height;
        var mergedProfile = hghtProfile.merge(windProfile, function (hgt, wind) {
            return {
                hgt: hgt,
                speed: wind.speed,
                dir: wind.dir
            }
        });

        var extract = function (p) {
            var windPt = mergedProfile.getValue(p);
            var windDir = windPt.dir;
            var windSpd = windPt.speed;
            return transform.toHodographCoord(windSpd, windDir);
        };

        // find 3km, 6km, 9km pivot points
        var threeKm, sixKm, nineKm;
        var itr = mergedProfile.iterator();
        while (itr.hasNext() && (threeKm = itr.next()).hgt < 3000);
        while (itr.hasNext() && (sixKm = itr.next()).hgt < 6000);
        while (itr.hasNext() && (nineKm = itr.next()).hgt < 9000);

        var elem03km, elem36km, elem69km, elemGT9km;

        if (threeKm != null) {
            elem03km = getTraceElement(mergedProfile.filter(function (pt) {
                return pt.hgt > 0 && pt.hgt <= threeKm.hgt;
            }), Elements.HODO_TRACE + "_0_3km", extract);
            elem03km.setAttribute('class', [elem03km.getAttribute('class'), Elements.classes.KM_0_3].join(" "));
        }

        if (threeKm != null && sixKm != null) {
            elem36km = getTraceElement(mergedProfile.filter(function (pt) {
                return pt.hgt >= threeKm.hgt && pt.hgt <= sixKm.hgt;
            }), Elements.HODO_TRACE + "_3_6km", extract);
            elem36km.setAttribute('class', [elem36km.getAttribute('class'), Elements.classes.KM_3_6].join(" "));
        }

        if (sixKm != null && nineKm != null) {
            elem69km = getTraceElement(mergedProfile.filter(function (pt) {
                return pt.hgt >= sixKm.hgt && pt.hgt <= nineKm.hgt;
            }), Elements.HODO_TRACE + "_6_9km", extract);
            elem69km.setAttribute('class', [elem69km.getAttribute('class'), Elements.classes.KM_6_9].join(" "));

            elemGT9km = getTraceElement(mergedProfile.filter(function (pt) {
                return pt.hgt >= nineKm.hgt;
            }), Elements.HODO_TRACE + "_gt_9km", extract);
            elemGT9km.setAttribute('class', [elemGT9km.getAttribute('class'), Elements.classes.KM_gt_9].join(" "));
        }

        [elem03km, elem36km, elem69km, elemGT9km].forEach(function (elem) {
            if (elem != null) {
                translateToCenter(elem);
                hodog.appendChild(elem);
            }
        });
    };

    return {
        plotHodographOutline: function (hodographCanvas) {
            hodographCanvas.setAttribute('x', dim.hodographArea.x.toString());
            hodographCanvas.setAttribute('y', dim.hodographArea.y.toString());
            hodographCanvas.setAttribute('width', dim.hodographArea.width.toString());
            hodographCanvas.setAttribute('height', dim.hodographArea.height.toString());
            plotHodographBoundary(hodographCanvas);
            plotHodographRadii(hodographCanvas);
            plotHodographAxes(hodographCanvas);
        },

        plotSoundingData: function(hodographCanvas) {
            plotWindTrace(hodographCanvas);
        }
    }
})(Dimensions, HodographPlotConfig, Transformer);


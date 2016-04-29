/**
 * Created by tangz on 4/28/2016.
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

    VIRTUAL_TEMP_TRACE: "TvTrace",
    VIRTUAL_PARCEL_TRACE: "sbParcelTraceTv",

    HODO_BOUNDARY: "hodographBoundary",
    WINDSPEED_RADII: "windRadii",
    HODO_AXES: "hodoAxes",

    hodoTrace: {
        KM_0_3: "Hodo_km_0_3",
        KM_3_6: "Hodo_km_3_6",
        KM_6_9: "Hodo_km_6_9",
        KM_gt_9: "Hodo_km_gt_9"
    },

    classes: {
        BOUNDARY: "bdy",
        TRACE: "trace",
        KM_0_3: "km_0_3",
        KM_3_6: "km_3_6",
        KM_6_9: "km_6_9",
        KM_gt_9: "km_gt_9"
    }
};

var createBoundaryRect = function(id, hgt, width) {
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.id = id;
    rect.setAttribute('class', Elements.classes.BOUNDARY);
    rect.setAttribute('height', hgt.toString());
    rect.setAttribute('width', width.toString());
    return rect;
};

var createGroupElement = function (id) {
    var groupElem = document.createElementNS(SVG_NS, 'g');
    groupElem.id = id;
    return groupElem;
};

var getPath = function(coords) {
    var allpoints = [];
    var line = document.createElementNS(SVG_NS, 'polyline');
    coords.forEach(function(coord) {
        allpoints.push([coord.x, coord.y].toString());
    });
    line.setAttribute('points', allpoints.join(" "));
    line.style.fill = 'none';
    return line;
};

var translate = function(elem, dx, dy) {
    elem.setAttribute('transform', 'translate(' + [dx, dy].toString() + ')');
};

var getTraceElement = function(profile, id, getCoordAtP, addPoints) {
    var g = createGroupElement(id);
    if (!profile.isEmpty()) {
        g.setAttribute('class', Elements.classes.TRACE);
        var coords = [];
        profile.pressures.forEach(function (pres) {
            var coord = getCoordAtP(pres);
            coords.push(coord);
            if (addPoints) {
                var circ = document.createElementNS(SVG_NS, 'circle');
                circ.setAttribute('cx', coord.x.toString());
                circ.setAttribute('cy', coord.y.toString());
                circ.setAttribute('r', '2');
                circ.style.opacity = '0';
                g.appendChild(circ);
            }
        });
        var path = getPath(coords);
        g.appendChild(path);
    }
    return g;
};

var setDimensions = function(canvas, dim) {
    canvas.setAttribute('x', dim.x.toString());
    canvas.setAttribute('y', dim.y.toString());
    // TODO: set viewport area instead of width/height explicitly
    canvas.setAttribute('width', dim.width.toString());
    canvas.setAttribute('height', dim.height.toString());
};
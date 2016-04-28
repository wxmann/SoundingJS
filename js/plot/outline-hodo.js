/**
 * Created by tangz on 4/28/2016.
 */

var HodographBackground = (function (dim, hodoConfig) {
    var cx = dim.width / 2;
    var cy = dim.height / 2;

    function translateToCenter(elem) {
        translate(elem, cx, cy);
    }

    var plotHodographBoundary = function (hodog) {
        var rect = createBoundaryRect(Elements.HODO_BOUNDARY, dim.height, dim.width);
        hodog.appendChild(rect);
    };

    var plotHodographRadii = function (hodog) {
        // may have to move this to plot-config
        var rMax = Math.sqrt(cx*cx + cy*cy);

        var hodoRadii = createGroupElement(Elements.WINDSPEED_RADII);
        translateToCenter(hodoRadii);
        hodog.appendChild(hodoRadii);

        hodoConfig.vRadii.forEach(function (v) {
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

    return {
        plotHodographOutline: function (hodographCanvas) {
            setDimensions(hodographCanvas, dim);
            plotHodographBoundary(hodographCanvas);
            plotHodographRadii(hodographCanvas);
            plotHodographAxes(hodographCanvas);
        }
    }
})(Dimensions.hodographArea, HodographPlotConfig);

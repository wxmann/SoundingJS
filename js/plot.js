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

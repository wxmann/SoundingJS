/**
 * Created by tangz on 4/17/2016.
 */

var plotTempTrace = function(trace, lineElem) {
    var allpoints = [];
    for (var pres in trace) {
        if (trace.hasOwnProperty(pres)) {
            var temp = trace[pres];
            var pair = [Number(pres), temp].toString();
            allpoints.push(pair);
        }
    }
    lineElem.setAttribute('points', allpoints.join(" "));
};

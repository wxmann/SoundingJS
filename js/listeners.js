/**
 * Created by tangz on 4/22/2016.
 */

var addTraceListeners = function() {
    var traces = [document.getElementById(Elements.TEMP_TRACE),
        document.getElementById(Elements.DEWPT_TRACE),
        document.getElementById(Elements.hodoTrace.KM_0_3),
        document.getElementById(Elements.hodoTrace.KM_3_6),
        document.getElementById(Elements.hodoTrace.KM_6_9),
        document.getElementById(Elements.hodoTrace.KM_gt_9)
    ];

    function setPointOpacity(elems, opacity) {
        elems.forEach(function (elem) {
            var circs = elem.getElementsByTagName('circle');
            for (var i = 0; i < circs.length; i++) {
                circs[i].style.opacity = opacity;
            }
        });
    }

    var showPoints = function () {
        setPointOpacity(traces, 1.0);
    };
    var doNotShowPoints = function () {
        setPointOpacity(traces, 0.0);
    };

    var disableOnMouseOut = function () {
        traces.forEach(function (trace) {
            trace.onmouseout = null;
        })
    };
    var enableOnMouseOut = function (fn) {
        traces.forEach(function (trace) {
            trace.onmouseout = fn;
        });
    };

    traces.forEach(function (trace) {
        trace.onmouseover = showPoints;
        trace.onmouseout = doNotShowPoints;
        trace.onclick = function () {
            if (trace.onmouseout) {
                disableOnMouseOut();
            } else {
                enableOnMouseOut(doNotShowPoints);
            }
        };
    })
};

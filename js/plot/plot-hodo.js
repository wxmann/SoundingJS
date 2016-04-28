/**
 * Created by tangz on 4/28/2016.
 */

var HodographPlots = (function (dim, hodoConfig, transform) {
    var cx = dim.width / 2;
    var cy = dim.height / 2;

    function translateToCenter(elem) {
        translate(elem, cx, cy);
    }

    var plotWindTrace = function(hodog) {
        var filteredProfile = saved.soundingProfiles().filter(function (ob) {
            return ob.hasHeight() && ob.hasWind();
        });

        var toHodoCoord = function (p) {
            var windPt = filteredProfile.getValue(p);
            var windDir = windPt.windDir();
            var windSpd = windPt.windSpeed();
            return transform.toHodographCoord(windSpd, windDir);
        };

        // find 3km, 6km, 9km pivot points
        var threeKm, sixKm, nineKm;
        var itr = filteredProfile.iterator();
        while (itr.hasNext() && (threeKm = itr.next()).height() < 3000);
        while (itr.hasNext() && (sixKm = itr.next()).height() < 6000);
        while (itr.hasNext() && (nineKm = itr.next()).height() < 9000);

        var elem03km, elem36km, elem69km, elemGT9km;

        if (threeKm != null) {
            elem03km = getTraceElement(filteredProfile.filter(function (pt) {
                return pt.height() > 0 && pt.height() <= threeKm.height();
            }), Elements.hodoTrace.KM_0_3, toHodoCoord, true);
            elem03km.setAttribute('class', [elem03km.getAttribute('class'), Elements.classes.KM_0_3].join(" "));
        }

        if (threeKm != null && sixKm != null) {
            elem36km = getTraceElement(filteredProfile.filter(function (pt) {
                return pt.height() >= threeKm.height() && pt.height() <= sixKm.height();
            }), Elements.hodoTrace.KM_3_6, toHodoCoord, true);
            elem36km.setAttribute('class', [elem36km.getAttribute('class'), Elements.classes.KM_3_6].join(" "));
        }

        if (sixKm != null && nineKm != null) {
            elem69km = getTraceElement(filteredProfile.filter(function (pt) {
                return pt.height() >= sixKm.height() && pt.height() <= nineKm.height();
            }), Elements.hodoTrace.KM_6_9, toHodoCoord, true);
            elem69km.setAttribute('class', [elem69km.getAttribute('class'), Elements.classes.KM_6_9].join(" "));
        }

        if (nineKm != null) {
            elemGT9km = getTraceElement(filteredProfile.filter(function (pt) {
                return pt.height() >= nineKm.height();
            }), Elements.hodoTrace.KM_gt_9, toHodoCoord, true);
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
        plotSoundingData: function(hodographCanvas) {
            plotWindTrace(hodographCanvas);
        }
    }
})(Dimensions.hodographArea, HodographPlotConfig, Transformer);
/**
 * Created by tangz on 4/30/2016.
 */

var logInterp = {
    forNumbers: function (p, pClosests, valClosests) {
        var v1 = valClosests.bottom,
            v2 = valClosests.top;
        var p1 = pClosests.bottom,
            p2 = pClosests.top;
        return v1 + (v2 - v1) * Math.log(p1 / p)/Math.log(p1 / p2);
    },

    forOb: function (p, pClosests, obClosests) {
        var v1 = obClosests.bottom,
            v2 = obClosests.top;
        var p1 = pClosests.bottom,
            p2 = pClosests.top;

        var pInterp = NODATA,
            TInterp = NODATA,
            TdInterp = NODATA,
            hInterp = NODATA,
            windSpdInterp = NODATA,
            windDirInterp = NODATA;

        if (v1.hasPressure() && v2.hasPressure()) {
            var pressureClosests = {
                bottom: v1.pressure(),
                top: v2.pressure()
            };
            pInterp = this.forNumbers(p, pClosests, pressureClosests);
        }

        if (v1.hasTemperature() && v2.hasTemperature()) {
            var tempClosests = {
                bottom: v1.temperature(),
                top: v2.temperature()
            };
            TInterp = this.forNumbers(p, pClosests, tempClosests);
        }

        if (v1.hasDewpoint() && v2.hasDewpoint()) {
            var dewptClosests = {
                bottom: v1.dewpoint(),
                top: v2.dewpoint()
            };
            TdInterp = this.forNumbers(p, pClosests, dewptClosests);
        }

        if (v1.hasHeight() && v2.hasHeight()) {
            var hgtClosests = {
                bottom: v1.height(),
                top: v2.height()
            };
            hInterp = this.forNumbers(p, pClosests, hgtClosests);
        }

        if (v1.hasWind() && v2.hasWind()) {
            var windSpdClosests = {
                bottom: v1.windSpeed(),
                top: v2.windSpeed()
            };
            windSpdInterp = this.forNumbers(p, pClosests, windSpdClosests);
            var windDirClosests = {
                bottom: v1.windDir(),
                top: v2.windDir()
            };
            windDirInterp = this.forNumbers(p, pClosests, windDirClosests);
        }

        return new Ob(pInterp, TInterp, TdInterp, windSpdInterp, windDirInterp, hInterp);
    }
};
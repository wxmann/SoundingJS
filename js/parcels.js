/**
 * Created by tangz on 4/27/2016.
 */

var parcelSources = function (soundingProfile) {
    var filteredProfile = soundingProfile.filter(function (ob) {
        return ob.hasPressure() && ob.hasHeight() && ob.hasTemperature() && ob.hasDewpoint();
    });

    /**
     * Surface-based parcel.
     */
    var surface = filteredProfile.iterator().first();
    
    function getMLOb(layer) {
        var n = 10;
        var sampling = layer / n;
        var p0 = surface.pressure();
        var pressures = [];
        for (var dp = 0; dp <= layer; dp += sampling) {
            pressures.push(p0 - dp);
        }

        var tempEnv = profileExtract.temperature(filteredProfile);
        var dewptEnv = profileExtract.dewpoint(filteredProfile);
        var tempSum = 0,
            dewptSum = 0;
        pressures.forEach(function (p) {
            tempSum += tempEnv.interp(p, logInterp.forNumbers);
            dewptSum += dewptEnv.interp(p, logInterp.forNumbers);
        });

        var tempAvg = tempSum / n;
        var dewptAvg = dewptSum / n;
        return new Ob(surface.pressure(), tempAvg, dewptAvg, NODATA, NODATA, NODATA);
    }

    /**
     * Mean-layered parcel averaged over lowest 100-mb from surface.
     */
    var ml100 = getMLOb(100);

    return {
        surface: surface,
        ml100: ml100
    }
};

var getSBParcel = function (fromProfiles) {
    return getParcel(parcelSources(fromProfiles).surface);
};

var getMLParcel = function (fromProfiles) {
    return getParcel(parcelSources(fromProfiles).ml100);
};

function parcelOb(p, parcelTemp, mixingRatio) {
    var parcOb = new Ob(p, parcelTemp, NODATA, NODATA, NODATA, NODATA);
    if (mixingRatio != null) {
        parcOb.hasMixingRatio = function () {
            return true;
        };
        parcOb.mixingRatio = function () {
            return mixingRatio;
        };
    }
    return parcOb;
}

/**
 * SourceOb must contain: temperature, dewpoint, pressure.
 *
 * @param sourceOb
 * @returns {Profile}
 */
function getParcel(sourceOb) {
    var LCL = lcl(sourceOb.pressure(), sourceOb.temperature(), sourceOb.dewpoint());
    var parcelTrace = new Profile();
    var p0 = sourceOb.pressure(),
        T0 = sourceOb.temperature(),
        r0 = sourceOb.mixingRatio(),
        pLCL = LCL.pressure(),
        TLCL = LCL.temperature(),
        rLCL = LCL.satMixingRatio();

    parcelTrace.addValue(p0, parcelOb(p0, T0, r0));
    parcelTrace.addValue(pLCL, parcelOb(pLCL, TLCL, rLCL));
    var thetaFromSfc = potentialTemp(p0, T0);
    var thetaEAboveLCL = thetaE(pLCL, TLCL);

    // generate trace for points every 25mb
    // do not hit 0mb, I wouldn't doubt some funky behavior there
    for (var p = p0 - 25; p >= 25; p -= 25) {
        var parcelTemp, mixRat;
        if (p > pLCL) {
            parcelTemp = tempAtDryAdiabat(p, thetaFromSfc);
            mixRat = sourceOb.mixingRatio();
        } else {
            parcelTemp = tempAtThetaE(p, thetaEAboveLCL);
            mixRat = mixingRatio(p, parcelTemp);
        }
        parcelTrace.addValue(p, parcelOb(p, parcelTemp, mixRat));
        // TODO also possibly: add height => get from interpolated height (also involved calculation)
    }
    return parcelTrace;
}
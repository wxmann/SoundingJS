/**
 * Created by tangz on 4/27/2016.
 */

var parcelSources = function (soundingProfile) {
    var filteredProfile = soundingProfile.filter(function (ob) {
        return ob.hasPressure() && ob.hasHeight() && ob.hasTemperature() && ob.hasDewpoint();
    });

    var surface = filteredProfile.iterator().first();

    return {
        surface: surface
    }
};

var getSBParcel = function (fromProfiles) {
    return getParcel(parcelSources(fromProfiles).surface);
};

function getParcel(sourceOb) {
    var LCL = lcl(sourceOb.pressure(), sourceOb.temperature(), sourceOb.dewpoint());
    var parcelTrace = new Profile();
    parcelTrace.addValue(sourceOb.pressure(), sourceOb.temperature());
    parcelTrace.addValue(LCL.pressure(), LCL.temperature());
    var thetaFromSfc = dryAdiabat(sourceOb.pressure(), sourceOb.temperature());
    var thetaEAboveLCL = thetaE(LCL.pressure(), LCL.temperature());

    // generate trace for points every 25mb
    // do not hit 0mb, I wouldn't doubt some funky behavior there
    for (var p = sourceOb.p - 25; p >= 25; p -= 25) {
        var parcelTemp;
        if (p > LCL.p) {
            parcelTemp = tempAtDryAdiabat(p, thetaFromSfc);
        } else {
            parcelTemp = tempAtThetaE(p, thetaEAboveLCL);
        }
        parcelTrace.addValue(p, parcelTemp);
    }
    return parcelTrace;
}
/**
 * Created by tangz on 4/27/2016.
 */

var parcelSources = function (fromProfiles) {
    var TTdHgtProfile = fromProfiles.allFields.apply(function (point) {
        return {
            p: fields.pressure(point),
            hgt: fields.height(point),
            T: fields.temperature(point),
            Td: fields.dewpoint(point)
        }
        }).filter(function (val) {
            return val.p != null &&
                    val.hgt != null &&
                    val.T != null &&
                    val.Td != null;
        });

    var surface = TTdHgtProfile.iterator().first();

    return {
        surface: surface
    }
};

var getSBParcel = function (fromProfiles) {
    return getParcel(parcelSources(fromProfiles).surface);
};

function getParcel(sourceOb) {
    var LCL = lcl(sourceOb.p, sourceOb.T, sourceOb.Td);
    var parcelTrace = new Profile();
    parcelTrace.addValue(sourceOb.p, sourceOb.T);
    parcelTrace.addValue(LCL.p, LCL.T);
    var thetaFromSfc = dryAdiabat(sourceOb.p, sourceOb.T);
    var thetaEAboveLCL = thetaE(LCL.p, LCL.T);

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
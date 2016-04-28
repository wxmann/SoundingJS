/**
 * Created by tangz on 4/17/2016.
 */

var SkewTPlots = (function (dim, skewTConfig, windBarbConfig, transform) {

    function getCoordFromProfile(profile) {
        var getCoordFromPres = function (pres) {
            var T = profile.getValue(pres);
            var p = Number(pres);
            var coord = transform.toSkewTCoord(p, T);
            return coord;
        };
        return getCoordFromPres;
    }

    var plotTempTrace = function(skewT) {
        var profile = profileExtract.temperature(saved.soundingProfiles());
        var elem = getTraceElement(profile, Elements.TEMP_TRACE, getCoordFromProfile(profile), true);
        skewT.appendChild(elem);
    };

    var plotDewptTrace = function (skewT) {
        var profile = profileExtract.dewpoint(saved.soundingProfiles());
        var elem = getTraceElement(profile, Elements.DEWPT_TRACE, getCoordFromProfile(profile), true);
        skewT.appendChild(elem);
    };


    function getWindBarb(windspd, winddir, coord) {
        var mainBarb = document.createElementNS(SVG_NS, 'path');
        var parts = [];
        parts.push(["M", coord.x, coord.y].join(" "));
        // wind barb properties
        var barbLength = windBarbConfig.barbLength;
        var longBarbHeight = windBarbConfig.longBarbHeight;
        var shortBarbHeight = windBarbConfig.shortBarbHeight;
        var flagWidth = windBarbConfig.flagWidth;
        var barbSpacing = windBarbConfig.barbSpacing;

        // draw barb to point north initially
        var barbEndCoord = {x: coord.x, y: coord.y - barbLength};
        parts.push(["L", barbEndCoord.x, barbEndCoord.y].join(" "));
        var currentPosition = barbEndCoord;
        mainBarb.style.fill = 'none';   // related to filling in the flags. Don't fill initially
        var left = windspd;

        // draw the 50kt barbs, if applicable
        while (left >= 50) {
            var triApex = {x: barbEndCoord.x + longBarbHeight, y: barbEndCoord.y + (flagWidth / 2)};
            var triEnd = {x: barbEndCoord.x, y: barbEndCoord.y + flagWidth};
            parts.push(["L", triApex.x, triApex.y].join(" "));
            parts.push(["L", triEnd.x, triEnd.y].join(" "));
            currentPosition.y += (barbSpacing + flagWidth);
            parts.push(["M", currentPosition.x, currentPosition.y].join(" "));

            // do fill in flags if they exist.
            mainBarb.style.fill = 'black';
            left -= 50;
        }

        // draw the 10kt barbs, if applicable
        while (left >= 10) {
            var barbApex = {x: currentPosition.x + longBarbHeight, y: currentPosition.y};
            parts.push(["L", barbApex.x, barbApex.y].join(" "));
            currentPosition.y += barbSpacing;
            parts.push(["M", currentPosition.x, currentPosition.y].join(" "));
            left -= 10;
        }

        // draw the 5kt barbs, if applicable
        while (left >= 5) {
            var barbApex = {x: currentPosition.x + shortBarbHeight, y: currentPosition.y};
            parts.push(["L", barbApex.x, barbApex.y].join(" "));
            currentPosition.y += barbSpacing;
            parts.push(["M", currentPosition.x, currentPosition.y].join(" "));
            left -= 5;
        }

        mainBarb.setAttribute('d', parts.join(" "));

        // incorporate wind dir and rotation
        mainBarb.setAttribute('transform', 'rotate(' + [winddir, coord.x, coord.y].join(" ") + ')');
        return mainBarb;
    }

    var plotWindBarbs = function (windBarbLiner) {
        var windProfile = profileExtract.wind(saved.soundingProfiles());
        var i = 0;
        var g = createGroupElement(Elements.WIND_BARBS);
        windBarbLiner.appendChild(g);

        windProfile.pressures.forEach(function (p) {
            if (i % windBarbConfig.deltaBarb == 0) {
                var wind = windProfile.getValue(p);
                var yCoord = transform.toSkewTCoord(p, 0).y;
                var xCoord = dim.skewTWindBarbs.width / 2;
                var barb = getWindBarb(wind.speed, wind.dir, {x: xCoord, y: yCoord});
                g.appendChild(barb);
            }
            i++;
        });
    };

    var plotSBParcel = function (skewT) {
        var parcelProfile = getSBParcel(saved.soundingProfiles());
        var elem = getTraceElement(parcelProfile, Elements.SB_PARCEL_TRACE, getCoordFromProfile(parcelProfile), false);
        skewT.appendChild(elem);
    };
    
    var plotVirtualTempTrace = function(skewT) {
        var profile = profileExtract.virtualTemp(saved.soundingProfiles());
        var elem = getTraceElement(profile, Elements.VIRTUAL_TEMP_TRACE, getCoordFromProfile(profile));
        skewT.appendChild(elem);
    };

    return {
        plotWindBarbs: function(windBarbCanvas) {
            setDimensions(windBarbCanvas, dim.skewTWindBarbs);
            plotWindBarbs(windBarbCanvas);
        },

        plotSoundingData: function (skewTCanvas) {
            plotTempTrace(skewTCanvas);
            plotDewptTrace(skewTCanvas);
            plotSBParcel(skewTCanvas);
            plotVirtualTempTrace(skewTCanvas);
        }
    }
    
})(Dimensions, SkewTPlotConfig, WindBarbConfig, Transformer);





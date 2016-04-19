/**
 * Created by tangz on 4/15/2016.
 */

/* Execute HTTP request and save Sounding object */

var loadSounding = function (station, year, month, day, hour) {
    // var url = getURL(station, year, month, day, hour);
    // executeJSONP(url, parseResponse);
    saved.setSounding(testSounding);
};

var parseResponse = function(response) {
    var rawData = response.data;
    var converted = convert(rawData);
    sanitize(converted);
    saved.setSounding(converted);
};

var executeJSONP = function(url, callbackFn) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        jsonpCallback: parseResponse
    });
};

/* Retrieve request url */

function getURL(station, year, month, day, hour) {
    var host = "http://mesonet.agron.iastate.edu/json/raob.py";
    var url = host + "?ts=" + getTimeStamp(year, month, day, hour) + "&station=" + station;
    return url;
}

function prependZero(num) {
    if (num <= 9) {
        return "0" + String(num);
    }
    return String(num);
}

function getTimeStamp(year, month, day, hour) {
    return year + prependZero(month) + prependZero(day) + prependZero(hour) + "00";
}

/* Sanitize and conversion */

var sanitize = function(sounding) {
    sounding.profile = sounding.profile.filter(function(point) {
        return isValidPressure(fields.pressure(point))
            && isValidTemp(fields.temperature(point))
            && isValidTemp(fields.dewpoint(point));
    });
};

function isValidPressure(pres) {
    return pres != null && pres > 0 && pres < 9999;
}

function isValidTemp(temp) {
    if (temp != null) {
        return temp < 999 && temp > -999;
    }
    return true;
}

var convert = function(rawResponse) {
    var soundingArr = rawResponse.profiles;
    return soundingArr[0];
};
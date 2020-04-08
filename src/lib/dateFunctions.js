exports.nDigits = function nDigits(n, digits) {
    n = ""+n;
    if (n.length === digits) {
        return n;
    } else {
        for (var i = 0; i < digits - n.length; i++) {
            n = "0" + n;
        }
        return n;
    }
}

exports.format12to24hour = function(input) { //in the format HH:MM(AM|PM)
    if (input.substr(5, 7).toLowerCase() === "pm") {
        let s = input.split(":");
        s[0] = +s[0] + 12;
        return s.join(":").substr(0, 5);
    } else {
        return s.substr(0, 5);
    }
}
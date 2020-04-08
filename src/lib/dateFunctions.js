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
function levenshtein(str1, str2) {
    var cost = new Array(),
        n = str1.length,
        m = str2.length,
        i, j;

    var minimum = function(a, b, c) {
        var min = a;
        if (b < min) {
            min = b;
        }
        if (c < min) {
            min = c;
        }
        return min;
    }

    if (n == 0) {
        return;
    }
    if (m == 0) {
        return;
    }

    for (var i = 0; i <= n; i++) {
        cost[i] = new Array();
    }

    for (i = 0; i <= n; i++) {
        cost[i][0] = i;
    }

    for (j = 0; j <= m; j++) {
        cost[0][j] = j;
    }

    for (i = 1; i <= n; i++) {
        var x = str1.charAt(i - 1);

        for (j = 1; j <= m; j++) {
            var y = str2.charAt(j - 1);

            if (x == y) {
                cost[i][j] = cost[i - 1][j - 1];
            } else {
                cost[i][j] = 1 + minimum(cost[i - 1][j - 1], cost[i][j - 1], cost[i - 1][j]);
            }

        } //endfor

    } //endfor

    return cost[n][m];
}

var sanitize = function(s) {
	var r = RegExp(/[^a-zA-Z0-9\s]/g)
	return s.toLowerCase().replace(r,"");
}
var goal = $(".goal").text();
var expected = sanitize(goal.substring(1,goal.length-1));
$(".pledge").on("keyup", function() {
	var value = sanitize($(".pledge").val());
	var distance = levenshtein(value, expected);
    console.log(distance);
	if(typeof distance !== 'undefined' && distance < 15) {
		$(".next-button").removeClass("disabled");
	}
	else {
		$(".next-button").addClass("disabled");
	}
});

$(".pledge").on("focus", function() {
    $(".smalltext").removeClass("hidden");
    $(".next-cont").removeClass("hidden");
})

$(".pledge").on("blur", function() {
    $(".smalltext").addClass("hidden");
    $(".next-cont").addClass("hidden");
})
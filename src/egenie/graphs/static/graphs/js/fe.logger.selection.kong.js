var fe;
function CSPL(){};
    
    CSPL._gaussJ = {};
    CSPL._gaussJ.solve = function(A, x) // in Matrix, out solutions
    {
        var m = A.length;
        for(var k=0; k<m; k++)  // column
        {
            // pivot for column
            var i_max = 0; var vali = Number.NEGATIVE_INFINITY;
            for(var i=k; i<m; i++) if(A[i][k]>vali) { i_max = i; vali = A[i][k];}
            CSPL._gaussJ.swapRows(A, k, i_max);
            
            if(A[i_max][i] == 0) console.log("matrix is singular!");
            
            // for all rows below pivot
            for(var i=k+1; i<m; i++)
            {
                for(var j=k+1; j<m+1; j++)
                    A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
                A[i][k] = 0;
            }
        }
        
        for(var i=m-1; i>=0; i--)   // rows = columns
        {
            var v = A[i][m] / A[i][i];
            x[i] = v;
            for(var j=i-1; j>=0; j--)   // rows
            {
                A[j][m] -= A[j][i] * v;
                A[j][i] = 0;
            }
        }
    }
    CSPL._gaussJ.zerosMat = function(r,c) {var A = []; for(var i=0; i<r; i++) {A.push([]); for(var j=0; j<c; j++) A[i].push(0);} return A;}
    CSPL._gaussJ.printMat = function(A){ for(var i=0; i<A.length; i++) console.log(A[i]); }
    CSPL._gaussJ.swapRows = function(m, k, l) {var p = m[k]; m[k] = m[l]; m[l] = p;}
        
        
    CSPL.getNaturalKs = function(xs, ys, ks)    // in x values, in y values, out k values
    {
        var n = xs.length-1;
        var A = CSPL._gaussJ.zerosMat(n+1, n+2);
            
        for(var i=1; i<n; i++)  // rows
        {
            A[i][i-1] = 1/(xs[i] - xs[i-1]);
            
            A[i][i  ] = 2 * (1/(xs[i] - xs[i-1]) + 1/(xs[i+1] - xs[i])) ;
            
            A[i][i+1] = 1/(xs[i+1] - xs[i]);
            
            A[i][n+1] = 3*( (ys[i]-ys[i-1])/((xs[i] - xs[i-1])*(xs[i] - xs[i-1]))  +  (ys[i+1]-ys[i])/ ((xs[i+1] - xs[i])*(xs[i+1] - xs[i])) );
        }
        
        A[0][0  ] = 2/(xs[1] - xs[0]);
        A[0][1  ] = 1/(xs[1] - xs[0]);
        A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1]-xs[0])*(xs[1]-xs[0]));
        
        A[n][n-1] = 1/(xs[n] - xs[n-1]);
        A[n][n  ] = 2/(xs[n] - xs[n-1]);
        A[n][n+1] = 3 * (ys[n] - ys[n-1]) / ((xs[n]-xs[n-1])*(xs[n]-xs[n-1]));
            
        CSPL._gaussJ.solve(A, ks);      
    }
        
    CSPL.evalSpline = function(x, xs, ys, ks)
    {
        var i = 1;
        while(xs[i]<x) i++;
        
        var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
        
        var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
        var b = -ks[i  ]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);
        
        var q = (1-t)*ys[i-1] + t*ys[i] + t*(1-t)*(a*(1-t)+b*t);
        return q;
    }

    CSPL.evalQprime = function(x, xs, ys, ks)
    {
        var i = 1;
        while(xs[i]<x) i++;


        var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
        
        var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
        var b = -ks[i  ]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);

        var xd = xs[i] - xs[i-1];
        var q_prime = ((ys[i]-ys[i-1])/xd) + ((1-2*t)*((a*(1-t)+(b*t))/xd)) + (t*(1-t)*((b-a)/xd));
        return q_prime;
    }

    CSPL.evalQprime2 = function(x, xs, ys, ks) {

        var i = 1;
        while(xs[i]<x) i++;


        var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
        
        var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
        var b = -ks[i  ]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);

        var j = Math.pow((xs[i] - xs[i-1]), 2);
        var q_prime2 = 2*((b-(2*a)+((a-b)*3*t))/j);
        return q_prime2;
    }

    CSPL.evalCurvature = function(x, xs, ys, ks) {
        var q_prime = CSPL.evalQprime(x, xs, ys, ks);
        var q_prime2 = CSPL.evalQprime2(x, xs, ys, ks);
        return (q_prime2 / Math.pow(1+Math.pow(q_prime,2),1.5));
    }


$(function () {
    'use strict';
    if (!fe) {
        fe = {};
    }

    if (!fe.logger) {
        fe.logger = {};
    }

    fe.logger.selection = (function () {
        var dragstart, dragmove, dragend, api;

        var point_a;
        var point_b;

        var group;

        var length_squared = function(v, w) {
            return Math.pow((v.x-w.x),2)+Math.pow((v.y-w.y),2);
        }

        var distToSegmentSquared = function(p, v, w) {
            var l2 = length_squared(v, w); // |w-v|^2
            if(l2 == 0) return length_squared(p,v); // v == w
            // Given line extending the segment, v+t(w-v)
            // Find projection of point p onto the line.
            // It falls where t = [(p-v).(w-v)]/|w-v|^2
            var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            if(t<0) return length_squared(p,v);
            if(t>1) return length_squared(p,w);
            return length_squared(p, { 
                x: v.x + t*(w.x-v.x),
                y: v.y + t*(w.y-v.y) 
            });
        }

        var distToSegment = function(p,v,w) { 
            return Math.sqrt(distToSegmentSquared(p,v,w));
        }


        var point_distance = function(dataset, p) {
            var min_dist = -1;
            var best1, best2;
            var result = {};

            $.each(dataset.data, function(index, point) {
                if(index < dataset.data.length-1) {

                    var y1 = 410 - dataset.ySc(point.value);
                    var x1 = dataset.xSc(point.t);

                    var y2 = 410 - dataset.ySc(dataset.data[index+1].value);
                    var x2 = dataset.xSc(dataset.data[index+1].t);

                    var x0 = p.x;
                    var y0 = p.y;

                    var v = {x:x1, y:y1};
                    var w = {x:x2, y:y2};

                    var dist = distToSegment(p,v,w);
                    if(min_dist == -1 || dist < min_dist) {
                        min_dist = dist;
                        best2 = {'x':x2, 'y':y2};
                        best1 = {'x':x1, 'y':y1};
                    }
                }

            });

            result.dist = min_dist;
            result.p1 = {'x':best1.x, 'y':best1.y};
            result.p2 = {'x':best2.x, 'y':best2.y};

            return result;
        };

        var between = function(a, b, x) {
            if(x >= a && x <= b) return true;
            if(x >= b && x <= a) return true;
            return false;
        };

        var distance = function(p1, p2) {
            return Math.sqrt(Math.pow((p2.x-p1.x),2)+Math.pow((p2.y-p1.y),2));
        };

        var project_point = function(dataset, p1, p2) {
            var result = {'x':-1,'y':-1};
            var found_result = false;
            var min_dist = -1;
            $.each(dataset.data, function(index, point) {
                if(index < dataset.data.length-1) {

                    var y1 = 410 - dataset.ySc(point.value);
                    var x1 = dataset.xSc(point.t);
                    var y2 = 410 - dataset.ySc(dataset.data[index+1].value);
                    var x2 = dataset.xSc(dataset.data[index+1].t);
                    var p3 = {'x':x1, 'y':y1};
                    var p4 = {'x':x2, 'y':y2};
                    var intersect_point = get_intersection_point(p1, p2, p3, p4);
                    if(between(p3.x, p4.x, intersect_point.x) && between(p3.y, p4.y, intersect_point.y)) {
                        var dist = distance(p2, intersect_point);
                        if(min_dist == -1 || dist < min_dist) {
                            min_dist = dist;
                            result = {'x':intersect_point.x, 'y':intersect_point.y};
                        }
                    }
                }
            });
            return result;
        }

        var get_perp_points = function(p1, p2) {
            var m;
            if(p2.x == p1.x) {
                m = 0;
            }
            else if(p2.y == p1.y) {
                m = -1;
            }
            else {
                m = -1/((p2.y-p1.y)/(p2.x-p1.x));
            }

            var a = {'x':p1.x-1, 'y':p1.y-m};
            var b = {'x':p1.x+1, 'y':p1.y+m};

            var c = {'x':p2.x-1, 'y':p2.y-m};
            var d = {'x':p2.x+1, 'y':p2.y+m};

            return [{'p1':a, 'p2':b}, {'p1':c, 'p2':d}];
        };


        var get_intersection_point = function(p1, p2, p3, p4) {
            var a = (p1.x*p2.y - p1.y*p2.x);
            var b = (p3.x*p4.y - p3.y*p4.x);

            var xd_1 = (p1.x-p2.x);
            var yd_1 = (p1.y-p2.y);
            var xd_2 = (p3.x-p4.x);
            var yd_2 = (p3.y-p4.y);

            var x = (a*xd_2 - xd_1*b) / (xd_1*yd_2 - yd_1*xd_2);
            var y = (a*yd_2 - yd_1*b) / (xd_1*yd_2 - yd_1*xd_2);

            return {'x':x, 'y':y};
        };

        var get_spline_data = function(dataset) {
            var xs = [];
            var ys = [];
            var ks = [];

            var points = [];
            $.each(dataset.data, function(index,point) {
                points.push({x:dataset.xSc(point.t), y:410-dataset.ySc(point.value)});
            });
            points = simplify(points);

            $.each(points, function(index, point) {
                xs.push(point.x);
                ys.push(point.y);
            });
            // Compute the knots
            CSPL.getNaturalKs(xs, ys, ks);
            return {'k':ks,'x':xs,'y':ys};
        };



        var CURVATURE_THRESHOLD = 0.0004;
        var PARALLEL_THRESHOLD = 50;
        var PERPENDICULAR_THRESHOLD = 60;

        var plot_extremes = function(dataset, spline_data) {
            var plot = fe.logger.plot;
            var x_min = dataset.xSc(dataset.x_min);//x_min;//dataset.xSc(dataset.data[0].t);
            var x_max = dataset.xSc(dataset.x_max);//dataset.xSc(dataset.data[dataset.data.length-1].t);
            var x = x_min;
            var done = false;
            do {
                var k = Math.abs(CSPL.evalCurvature(x, spline_data.x, spline_data.y, spline_data.k));
                var y = CSPL.evalSpline(x, spline_data.x, spline_data.y, spline_data.k);
                var y_l = Math.abs(CSPL.evalCurvature(x-1, spline_data.x, spline_data.y, spline_data.k));
                var y_r = Math.abs(CSPL.evalCurvature(x+1, spline_data.x, spline_data.y, spline_data.k));
                

                // var color = d3.scale.linear().domain([0,0.3]).range(["white","black"]);
                debug.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 1)
                    .attr("fill", 'black');


                if(y_l < k - CURVATURE_THRESHOLD && y_r < k - CURVATURE_THRESHOLD) {
                    debug.append("circle")
                     .attr("cx", x)
                     .attr("cy", y)
                     .attr("r", 3)
                     .attr("stroke", 'blue')
                     .style("fill", "blue");
                }
                else if(y_l > k + CURVATURE_THRESHOLD && y_r > k + CURVATURE_THRESHOLD) {
                    debug.append("circle")
                     .attr("cx", x)
                     .attr("cy", y)
                     .attr("r", 3)
                     .attr("stroke", 'yellow')
                     .style("fill", "yellow");
                }

                if(x >= x_max) {
                    done = true;
                }
                x++;
            } while(!done);
        }

        var get_extreme = function(dataset, spline_data, x, left) {
            // walk left or right to nearest minima or maxima
            var x_min = dataset.xSc(dataset.x_min);//x_min;//dataset.xSc(dataset.data[0].t);
            var x_max = dataset.xSc(dataset.x_max);//dataset.xSc(dataset.data[dataset.data.length-1].t);
            var y;
            var found = false;
            var done = false;
            do {
                y = Math.abs(CSPL.evalCurvature(x, spline_data.x, spline_data.y, spline_data.k));
                var y_l = Math.abs(CSPL.evalCurvature(x-1, spline_data.x, spline_data.y, spline_data.k));
                var y_r = Math.abs(CSPL.evalCurvature(x+1, spline_data.x, spline_data.y, spline_data.k));
                
                // console.log(x+"="+y_l+","+y+","+y_r);

                // if(y > curvature_threshold) {
                //     found = true;
                // }
                if(y_l < y - CURVATURE_THRESHOLD && y_r < y - CURVATURE_THRESHOLD) {
                    // maxima
                    found = true;
                }
                else if(y_l > y + CURVATURE_THRESHOLD && y_r > y + CURVATURE_THRESHOLD) {
                    // minima
                    found = true;
                }

                if(left) {
                    x--;
                    if(x <= x_min) {
                        done = true;
                    }
                }
                else {
                    x++;
                    if(x >= x_max) {
                        done = true;
                    }
                }
            } while(!done && !found);

            var p = {'x':x, 'y':y};
            // Map onto original data
            var l = {'x':-1,'y':-1};
            var r = {'x':-1,'y':-1};
            $.each(dataset.data, function(index, point) {
                var p_x = dataset.xSc(point.t);
                var p_y = 410 - dataset.ySc(point.value);
                if(p_x >= p.x && l.x == -1) {
                    if(index > 0) {
                        l.x = dataset.xSc(dataset.data[index-1].t);
                        l.y = 410 - dataset.xSc(dataset.data[index-1].value);
                        r.x = p_x;
                        r.y = p_y;
                    }
                } 
            });
            if(distance(p,l) < distance(p,r)) {
                return l;
            }
            else {
                return r;
            }
        }

        var is_parallel = function(point_a, point_b, dataset) {
            var perp_points = get_perp_points(point_a, point_b);
            var p1 = project_point(dataset, perp_points[0].p1, perp_points[0].p2);
            var p2 = project_point(dataset, perp_points[1].p1, perp_points[1].p2);
            var da = distance(point_a, p1);
            var db = distance(point_b, p2);
            var result = Math.min(da, db);

            if(distance(point_a, p1) < PARALLEL_THRESHOLD && distance(point_b, p2) < PARALLEL_THRESHOLD) {
                if((p1.x < point_a.x && p2.x < point_b.x) || 
                            (p1.x > point_a.x && p2.x > point_b.x)) {
                    return result;
                }
            }
            return false;
        }

        var is_perpendicular = function(point_a, point_b, dataset) {
            var p1 = project_point(dataset, point_a, point_b);
            if (distance(p1, point_b) < PERPENDICULAR_THRESHOLD) {
                return distance(p1, point_b);
            }
            return false;
        }

        var line = d3.svg.line()
            .x(function (d) { return d.x})
            .y(function (d) { return d.y});

        var debug;

        api = {
            drag_start: function(instance) {
               var plot = fe.logger.plot;
               
               // Remove debug between selections for clarity.
               if(debug) {
                   debug.remove();
               }
               debug = plot.get_chart().append("svg:g");

               var rect = d3.select(instance);
               var pos = d3.mouse(rect.node());
               point_a = {x:pos[0], y:pos[1]};
               group = plot.get_chart().append("svg:g");
            },

            drag_move: function(instance) {
                group.selectAll("*").remove();
                var rect = d3.select(instance);
                var pos = d3.mouse(rect.node());
                point_b = {x:pos[0], y:pos[1]};

                // // append data plot/path to svg
                group.append("svg:path")
                    .attr('class', "trace")
                    .attr("d", line([point_a, point_b]));


                var min_par = -1;
                var min_per = -1;
                var min_par_dataset = 0;
                var min_per_dataset = 0;

                var datasets = fe.datastore.get_datasets();
                $.each(datasets, function(index, dataset) {
                    if(!dataset.visible) {
                        return;
                    }
                    var par = is_parallel(point_a, point_b, dataset);
                    var per = is_perpendicular(point_a, point_b, dataset);

                    if(par > 0) {
                        if(min_par == -1 || par < min_par) {
                            min_par = par;
                            min_par_dataset = dataset;
                        }
                    }
                    else if(per > 0) {
                        if(min_per == -1 || per < min_per) {
                            min_per = per;
                            min_per_dataset = dataset;
                        }
                    }
                });

                if(min_per == -1 && min_par == -1) {
                    // Neither par or per.
                    return;
                }
                else if(min_par > -1 && (min_per == -1 || min_par < min_per)) {
                    console.log("Parallel");
                    var perp_points = get_perp_points(point_a, point_b);
                    var p1 = project_point(min_par_dataset, perp_points[0].p1, perp_points[0].p2);
                    var p2 = project_point(min_par_dataset, perp_points[1].p1, perp_points[1].p2);
                    group.append("svg:path")
                        .attr('class', "thintrace")
                        .attr("d", line([point_a, p1]));
                    group.append("svg:path")
                        .attr('class', "thintrace")
                        .attr("d", line([point_b, p2]));
                }
                else if(min_per > -1 && (min_par == -1 || min_per < min_par)) {
                    var p1 = project_point(min_per_dataset, point_a, point_b);

                    group.append("svg:path")
                        .attr('class', "thintrace")
                        .attr("d", line([point_b, p1]));

                    group.append("circle")
                        .attr("cx", p1.x)
                        .attr("cy", p1.y)
                        .attr("r", 3);
                }


        	},

            drag_end: function(instance) {
                console.log("drag end");
                var rect = d3.select(instance);
                var pos = d3.mouse(rect.node());
                point_b = {x:pos[0], y:pos[1]};
                group.remove();

                var datasets = fe.datastore.get_datasets();
                var plot = fe.logger.plot;
                if(distance(point_a, point_b) < 2) {
                    plot.clear_selection();
                    return;
                }
                var bounds = [-1,-1]
                var selections = [];

                var min_par = -1;
                var min_per = -1;
                var min_par_dataset = 0;
                var min_per_dataset = 0;
                var min_per_index = -1;
                var min_par_index = -1;

                var datasets = fe.datastore.get_datasets();
                $.each(datasets, function(index, dataset) {
                    if(!dataset.visible) {
                        return;
                    }
                    var par = is_parallel(point_a, point_b, dataset);
                    var per = is_perpendicular(point_a, point_b, dataset);

                    if(par > 0) {
                        if(min_par == -1 || par < min_par) {
                            min_par = par;
                            min_par_dataset = dataset;
                            min_par_index = index;
                        }
                    }
                    else if(per > 0) {
                        if(min_per == -1 || per < min_per) {
                            min_per = per;
                            min_per_dataset = dataset;
                            min_per_index = index;
                        }
                    }
                });

                if(min_per == -1 && min_par == -1) {
                    // Neither par or per.
                    return;
                }
                else if(min_par > -1 && (min_per == -1 || min_par < min_per)) {
                    // Parallel
                    var spline_data = get_spline_data(min_par_dataset);
                    // plot_extremes(min_par_dataset, spline_data);

                    var perp_points = get_perp_points(point_a, point_b);
                    var p1 = project_point(min_par_dataset, perp_points[0].p1, perp_points[0].p2);
                    var p2 = project_point(min_par_dataset, perp_points[1].p1, perp_points[1].p2);

                    selections.push(min_par_index);
                    var l_p = p1;
                    var r_p = p2;
                    if(p2.x < p1.x) {
                        l_p = p2;
                        r_p = p1;
                    }

                    // travel left and right to get the nearest extremes.
                    var l = get_extreme(min_par_dataset, spline_data, l_p.x, true);
                    var r = get_extreme(min_par_dataset, spline_data, r_p.x, false);

                    if(l.x == -1 || r.x == -1) {
                        return;
                    }

                    if(r.x-l.x > 2) {
                        if(bounds[0] == -1 || l.x < bounds[0]) {
                            bounds[0] = l.x;
                        }
                        if(bounds[1] == -1 || r.x > bounds[1]) {
                            bounds[1] = r.x;
                        }

                    }

                    // debug.append("circle")
                    //          .attr("cx", l_p.x)
                    //          .attr("cy", l_p.y)
                    //          .attr("r", 4)
                    //          .attr("stroke", 'pink')
                    //          .style("fill", "pink");

                    // debug.append("circle")
                    //          .attr("cx", r_p.x)
                    //          .attr("cy", r_p.y)
                    //          .attr("r", 4)
                    //          .attr("stroke", 'pink')
                    //          .style("fill", "pink");


                    // debug.append("circle")
                    //          .attr("cx", l.x)
                    //          .attr("cy", l.y)
                    //          .attr("r", 6)
                    //          .attr("stroke", 'green')
                    //          .style("fill", "green");

                    // debug.append("circle")
                    //          .attr("cx", r.x)
                    //          .attr("cy", r.y)
                    //          .attr("r", 6)
                    //          .attr("stroke", 'green')
                    //          .style("fill", "green");
                
                }
                else if(min_per > -1 && (min_par == -1 || min_per < min_par)) {
                    // perpendicular

                    var spline_data = get_spline_data(min_per_dataset);
                    // plot_extremes(min_per_dataset, spline_data);
                    var p1 = project_point(min_per_dataset, point_a, point_b);
                    console.log("Dataset "+min_per_index+" is perp to selection");
                    selections.push(min_per_index);
                    if(p1.x == -1 && p1.y == -1) {
                        return;
                    }
                    console.log("Get extreme l");
                    var l = get_extreme(min_per_dataset, spline_data, p1.x-1, true);
                    console.log("Get extreme r");
                    var r = get_extreme(min_per_dataset, spline_data, p1.x+1, false);
                    if(l.x == -1 || r.x == -1) {
                        return;
                    }

                    var line_length = Math.sqrt(Math.pow(r.y-l.y, 2)+Math.pow(r.x-l.x, 2));

                    // Calculate how far up the line p1 is
                    var p1_pos = Math.sqrt(Math.pow(p1.y-l.y, 2)+Math.pow(p1.x-l.x,2));
                    var position = p1_pos/line_length;

                    console.log("l:"+l.x+","+l.y);
                    console.log("r:"+r.x+","+r.y);

                    console.log("Position: "+position);

                    if(position >= 0.4 && position <= 0.6) {
                        // midpoint
                        // Just select segment
                        if(bounds[0] == -1 || l.x < bounds[0]) {
                            bounds[0] = l.x;
                        }
                        if(bounds[1] == -1 || r.x > bounds[1]) {
                            bounds[1] = r.x;
                        }
                    }
                    else if(position < 0.4) {
                        // migrate l to the next segment
                        console.log("Get other extreme l");
                        l = get_extreme(min_per_dataset, spline_data, l.x-1, true);
                        if(bounds[0] == -1 || l.x < bounds[0]) {
                            bounds[0] = l.x;
                        }
                        if(bounds[1] == -1 || r.x > bounds[1]) {
                            bounds[1] = r.x;
                        }
                    }
                    else if(position > 0.6) {
                        // migrate r to the next segment
                        console.log("Get other extreme r");
                        r = get_extreme(min_per_dataset, spline_data, r.x+1, false);
                        if(bounds[0] == -1 || l.x < bounds[0]) {
                            bounds[0] = l.x;
                        }
                        if(bounds[1] == -1 || r.x > bounds[1]) {
                            bounds[1] = r.x;
                        }
                    }


                    // debug.append("circle")
                    //          .attr("cx", l.x)
                    //          .attr("cy", l.y)
                    //          .attr("r", 6)
                    //          .attr("stroke", 'red')
                    //          .style("fill", "red");

                    // debug.append("circle")
                    //          .attr("cx", r.x)
                    //          .attr("cy", r.y)
                    //          .attr("r", 6)
                    //          .attr("stroke", 'red')
                    //          .style("fill", "red");
                }

                if(selections.length > 0) {
                    if(bounds[1] - bounds[0] > 2) {
                        var new_selection = selections.slice();
                        fe.logger.plot.create_selection(bounds[0], bounds[1]-bounds[0], selections);
                    
                        fe.logger.plot.complete_selection(bounds[0], bounds[1]-bounds[0], new_selection, [point_a,point_b]);
                    }
                    else {
                        fe.logger.plot.clear_selection();
                    }
                }
                else {
                    fe.logger.plot.clear_selection();
                }
            }
        };

        return api;
    }());
});
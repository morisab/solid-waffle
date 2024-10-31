/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.49720044792834, "KoPercent": 7.502799552071669};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5408734602463606, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4266666666666667, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.765, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.68, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.62, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.7089552238805971, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.7301587301587301, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.7671957671957672, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.04833333333333333, 500, 1500, "Login Request"], "isController": false}, {"data": [0.545, 500, 1500, "Home Request"], "isController": false}, {"data": [0.32666666666666666, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2679, 201, 7.502799552071669, 1035.8480776409097, 43, 4563, 735.0, 2296.0, 2834.0, 4132.0, 230.570617092693, 159.5985024528789, 62.02394784404854], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 1229.5400000000006, 254, 3351, 1081.0, 2331.2000000000003, 2711.7499999999995, 3208.98, 43.35260115606936, 46.61251354768786, 16.045542810693643], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 573.2833333333333, 82, 2379, 384.5, 1231.7, 1625.6999999999998, 2301.8100000000004, 45.06534474988734, 34.45914544840018, 8.31772476340694], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 650.8300000000002, 59, 2459, 535.0, 1460.0000000000061, 1876.3499999999995, 2315.71, 43.994720633523976, 13.662423009238891, 8.163082930048395], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 743.7066666666668, 74, 2473, 711.0, 1181.9000000000003, 1447.9999999999998, 2205.900000000001, 37.147102526002975, 13.714681231426448, 6.819975854383357], "isController": false}, {"data": ["Login Request-2", 201, 0, 0.0, 733.258706467661, 60, 2465, 558.0, 1332.8, 1388.9, 1878.239999999998, 26.22993605637479, 20.056679621231893, 4.841267494780112], "isController": false}, {"data": ["Home Request-1", 189, 0, 0.0, 598.0476190476195, 113, 2413, 505.0, 1146.0, 1269.5, 2411.2, 24.472355302343647, 18.71274824388191, 4.5168702657646], "isController": false}, {"data": ["Home Request-0", 189, 0, 0.0, 542.6190476190476, 88, 2662, 458.0, 939.0, 1524.0, 2622.3999999999996, 23.393984404010396, 7.264928750464166, 4.294989324173784], "isController": false}, {"data": ["Login Request", 300, 201, 67.0, 2590.9333333333343, 326, 4563, 2614.5, 4107.700000000001, 4228.6, 4513.98, 28.71912693854107, 35.833561440982194, 16.22826994184377], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 911.4, 43, 3350, 750.0, 1749.6000000000008, 2194.8999999999996, 3016.9900000000016, 35.94536304816678, 30.842455405283967, 10.779045538281812], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1340.5266666666662, 139, 2992, 1374.5, 2187.9000000000005, 2462.9499999999994, 2758.3500000000004, 30.1901982489685, 11.055980804065614, 7.783410486062192], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 201, 100.0, 7.502799552071669], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2679, 201, "Test failed: text expected to contain /Logout/", 201, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 201, "Test failed: text expected to contain /Logout/", 201, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

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

    var data = {"OkPercent": 92.19910846953938, "KoPercent": 7.800891530460624};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6968796433878157, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6033333333333334, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.9066666666666666, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.88, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.76, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.8357142857142857, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.8769633507853403, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.8926701570680629, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.10666666666666667, 500, 1500, "Login Request"], "isController": false}, {"data": [0.6516666666666666, 500, 1500, "Home Request"], "isController": false}, {"data": [0.6333333333333333, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2692, 210, 7.800891530460624, 671.6575037147118, 19, 3466, 513.0, 1302.7000000000003, 1699.6999999999998, 2442.07, 259.72021225277376, 180.24733930294258, 69.95503949589965], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 761.9233333333333, 176, 2111, 682.5, 1243.1000000000004, 1366.2499999999998, 1889.810000000001, 38.43689942344651, 41.32717408712364, 14.226157110826394], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 363.64333333333326, 19, 1237, 295.5, 807.4000000000002, 860.2499999999998, 1180.8400000000001, 40.14452027298274, 30.696444700923326, 7.4094866519470095], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 392.4566666666667, 103, 1670, 330.5, 671.8000000000008, 838.2499999999995, 1219.4000000000005, 38.53069612124325, 11.965587272026715, 7.149250256871308], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 518.073333333333, 46, 1294, 480.5, 845.8000000000001, 904.9, 1271.89, 36.354823073194375, 13.228327223703344, 6.67451829859428], "isController": false}, {"data": ["Login Request-2", 210, 0, 0.0, 472.72857142857146, 96, 1295, 408.5, 798.3000000000001, 928.4999999999999, 1293.23, 25.436046511627907, 19.449633221293603, 4.694739053415698], "isController": false}, {"data": ["Home Request-1", 191, 0, 0.0, 409.4188481675395, 95, 1691, 388.0, 724.0000000000002, 816.0, 1242.9599999999923, 24.116161616161616, 18.440385298295453, 4.451127485795454], "isController": false}, {"data": ["Home Request-0", 191, 0, 0.0, 432.4712041884816, 102, 1327, 399.0, 673.0, 928.1999999999999, 1273.639999999999, 22.73538864420902, 7.060403895369599, 4.1740752588977506], "isController": false}, {"data": ["Login Request", 300, 210, 70.0, 1642.5866666666666, 462, 3466, 1599.0, 2391.2000000000007, 2546.6, 3275.0300000000007, 30.456852791878173, 38.53803140862944, 17.37884676395939], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 703.1400000000002, 169, 2190, 660.5, 1191.9, 1300.95, 2032.2500000000025, 35.095928872250816, 30.25093132165419, 10.567507567559662], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 778.2699999999999, 237, 1629, 760.0, 1262.6000000000001, 1308.85, 1387.97, 32.27888960619755, 11.820882424144608, 8.321901226597804], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 210, 100.0, 7.800891530460624], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2692, 210, "Test failed: text expected to contain /Logout/", 210, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 210, "Test failed: text expected to contain /Logout/", 210, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

/**
 *  # FIND ALL THE SATELLITES LAUNCHED ON A SPECIFIC DATE
 *  Since, the problem is grouping data about starlink satellites by launch_date, we can perform a MONGODB query on the STARLINK-API to fetch the results based on
 *  the launch_date. Since, no return type or format is mentioned, we assume the format as follows
 *  
 *  1. CREATION DATE: "CREATION DATE OF THE SATELLITE"
 *  2. OBJECT NAME: "NAME OF THE SATELLITE"
 *  3. OBJECT TYPE: "TYPE OF THE SATELLITE"
 *  4. LAUNCH DATE: "LAUNCH DATE OF THE SATELLITE"
 * 
 *  Perform search for all those entries which match the date given and present the results.
 *  
 *  DATE FORMAT - YYYY-MM-DD
 *  The objective is having flexibility with the date entered. i.e., the function needs to be able to perform search even if day/month information is missing.
 * 
 *  STEPS FOR CODING
 *  1. PERFORM CHECKS ON THE DATE ENTERED AND CREATE A MONGODB QUERY WHICH IS USED TO FETCH THE DATA FROM STARLINK-API
 *  2. IF THE DATE IS VALID - PROCEED WITH THE DATA FETCH PHASE AND RETURN THE RESULT OBTAINED
 *  3. PRESENT THE RESULT IN A HTML TABLE BY FILLING IT WITH THE OBTAINED VALUES
 *  4. SINCE THE DATA RETRIEVED CAN BE HUGE, WE NEED TO PERFORM API-CALL WITH PAGINATION OPTION
 *  5. USING PAGINATION OPTION, WE CAN MAKE API-CALLS TO RECEIVE ONLY A LIMITED VALUE OF RESULTS AT ONE TIME
 *  6. PAGINATION HAS BEEN HANDLED BY USING BUTTONS TO MOVE FROM PREV_PAGE TO NEXT_PAGE
 * 
 *  STARLINK-SATELLITES
    [
        "id" : "ID OF THE SATELLITE"
        "CREATION DATE": "CREATION DATE OF THE SATELLITE"
        "OBJECT NAME": "NAME OF THE SATELLITE"
        "OBJECT TYPE": "TYPE OF THE SATELLITE"
        "LAUNCH DATE": "LAUNCH DATE OF THE SATELLITE"
    ]
    ...
*/

function pad(num, size) {
    /*
    Converts int to string by padding zeroes to fit the size required
    */

    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function checkLeap(year){
    // Checks given year is leap or not for defining the number of days in the month of Feb
    return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0));
}

function checkValidDate(year, month, day){
    // Checks if the entered date is valid or not
    // Example - 31-02-2020 is not a valid date, so the function returns false
    // Based on the output given by this function, our API is called
    // If a erroneous date is given, we simply return "NO RECORDS FOUND"

    month_day_map = {
        "1": 31,
        "3": 31,
        "4": 30,
        "5": 31,
        "6": 30,
        "7": 31,
        "8": 31,
        "9": 30,
        "10": 31,
        "11": 30,
        "12": 31
    }

    if(checkLeap(year)){
        if(month == 2 && day <= 29 && day >=1) return true;
        else{
            if(month >= 1 && month <= 12 && day >= 1 && day <= month_day_map[month]){
                return true;
            }
            else return false;
        }
    }

    else{
        if(month == 2 && day <= 28 && day >=1) return true;
        else{
            if(month >= 1 && month <= 12 && day >= 1 && day <= month_day_map[month]){
                return true;
            }
            else return false;
        }
    }
}

function BuildTable(data){
    // Used to dynamically build table and fill the table with the results returned by the STARLINK-API

    var table = document.getElementById("result-table");

    table.innerHTML = `<tr>
                        <th>OBJECT NAME</th>
                        <th>OBJECT TYPE</th>
                        <th>CREATION DATE</th>
                        <th>LAUNCH DATE</th>
                    </tr>`

    if(data.length != 0){
        for(i=0;i < data.length; i++){
            var row = `<tr>
                <td>${data[i].OBJECT_NAME}</td>
                <td>${data[i].OBJECT_TYPE}</td>
                <td>${data[i].CREATION_DATE}</td>
                <td>${data[i].LAUNCH_DATE}</td>
            </tr>`
            table.innerHTML += row;
        }
    }

    else{
        table.innerHTML = `<p>No records found</p>`;
    }
}

function createButtons(data){
    // Used to build buttons and handlers for Pagination of the results received from the STARLINK-API
    if(data.length != 0){

        if(!document.getElementById("prev-page")){
            var prev_btn = document.createElement("BUTTON");
            var next_btn = document.createElement("BUTTON");
            var nav_div = document.createElement("div");
            nav_div.id = "nav-div"
            
            var div = document.getElementById("main");

            prev_btn.id = 'prev-page';
            next_btn.id ='next-page';
            prev_btn.innerHTML = "&lt";
            next_btn.innerHTML = "&gt";
            
            nav_div.appendChild(prev_btn);
            nav_div.appendChild(next_btn);

            div.appendChild(nav_div);
        }

        else{

            if(document.getElementById("prev-page").getAttribute("hidden")){
                document.getElementById("prev-page").removeAttribute("hidden");
                document.getElementById("next-page").removeAttribute("hidden");
            }
            
            document.getElementById("prev-page").disabled = false;
            document.getElementById("next-page").disabled = false;
        }
    }

    else{
        if(document.getElementById("prev-page")){
            document.getElementById("prev-page").setAttribute("hidden", "hidden");
            document.getElementById("next-page").setAttribute("hidden", "hidden");
        }
    }
}

async function get_all_starlink_satellites(year, month, day, page){
    /**
     *  This function performs fetch call to the STARLINK-API and retrieves data of all the satellites launched on a specific date
     *  Params:
     *      1. Year - year for which satellite data is required - YYYY format
     *      2. Month - month for which satellite data is required - MM format
     *      3. Day - day for which satellite data is required - DD format
     *      4. Page - Page index used for pagination call to API
     */
    var STARLINK_API = "https://api.spacexdata.com/v4/starlink/query"

    var mongo_query;

    /**
     * This function creates a MONGODB query using the parameters given and sends a POST request to the STARLINK-API
     * Based on the availability of the parameters to the function, we have 3 cases to handle
     * 
     * CASE 1: if month is not given - Return all the satellites launched in year given $gte -> 01-01-year to $lt -> 01-01-year+1
     * CASE 2: if day is not given - Return all the satellites launched in that month+year given i.e., $gte -> 01-month-year to $lt -> 01-month+1-year
     * CASE 3: if day is given - Return all the satellites launched on that day-month-year given i.e., $eq -> day-month-year
     * 
     * We assume that for this function to be called atleast year should be given
     */

    // case 1: 
    if(isNaN(month)){
        var lower_date = year.toString() + "-01-01";
        var upper_date = (year+1).toString() + "-01-01";

        console.log(lower_date);
        console.log(upper_date);

        mongo_query = {
            "$gte": lower_date,
            "$lt": upper_date
        }
    }
    // case 2: 

    else if(isNaN(day)){
        var lower_date = year.toString() + "-" + pad(month,2) + "-01";
        var upper_date = year.toString() + "-" + pad(month+1,2) + "-01";

        console.log(lower_date);
        console.log(upper_date);

        mongo_query = {
            "$gte": lower_date,
            "$lt": upper_date
        }
    }

    // case 3: 

    else{
        var exact_date = year.toString() + "-" + pad(month,2) + "-" + pad(day,2);

        console.log(exact_date);

        mongo_query = {
            "$eq": exact_date
        }

    }

    // QUERY TO BE SENT TO THE STARLINK-API
    var query_body = {
        "query": {
            "spaceTrack.LAUNCH_DATE": mongo_query
        },
        "options": {
            "select": {
                "spaceTrack.OBJECT_NAME": 1,
                "spaceTrack.OBJECT_TYPE": 1,
                "spaceTrack.CREATION_DATE": 1,
                "spaceTrack.LAUNCH_DATE": 1
            },
            "page": page
        }
    };

    // REQUESTING DATA FROM API
    var starlink_dets =  fetch(STARLINK_API, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(query_body),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        })
        .then(function (response) {
            if(response.status !== 200){
                console.log(`Error : ${response.status}`)
                return;
            }
            var data = response.json().then(function (data){
                data = JSON.stringify(data);
                data = JSON.parse(data);
                
                return data;
            })

            return data;
        })

    return starlink_dets;
}

window.onload = async function fetchStarlinks(){

    var form = document.getElementById('starlink-form');
    var starlink_dets;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var year = parseInt(document.getElementById('year').value);
        var month = parseInt(document.getElementById('month').value);
        var day = parseInt(document.getElementById('day').value);
        var page = 1;

        // Performing first request which will fetch the data to be presented by default
        starlink_dets = await get_all_starlink_satellites(year, month, day, page);
        
        var docs = starlink_dets.docs;
        const totalPages = starlink_dets.totalPages;

        var table_data = []

        for(var i=0;i< docs.length; i++){
            table_data.push(docs[i].spaceTrack);
        }

        // Building and filling a table and adding pagination
        BuildTable(table_data);
        createButtons(table_data);

        var prev_btn = document.getElementById('prev-page');
        var next_btn = document.getElementById('next-page');

        var curr_page = 1;
        prev_btn.disabled = true;

        prev_btn.onclick = async function() {
            // Pagination handling - If < is clicked, we perform the prev-page operation until we reach the first page
            curr_page--;

            if(curr_page>1){
                prev_btn.disabled = false;
                next_btn.disabled = false;

                starlink_dets = await get_all_starlink_satellites(year, month, day, curr_page);
                var docs = starlink_dets.docs;

                var table_data = []

                for(var i=0;i< docs.length; i++){
                    table_data.push(docs[i].spaceTrack);
                }
                BuildTable(table_data);
            }
            else if(curr_page == 1){
                prev_btn.disabled = true;
                
                starlink_dets = await get_all_starlink_satellites(year, month, day, curr_page);
                var docs = starlink_dets.docs;

                var table_data = []

                for(var i=0;i< docs.length; i++){
                    table_data.push(docs[i].spaceTrack);
                }
                BuildTable(table_data);
            }
        }
        next_btn.onclick = async function() {

            // Pagination handling - If > is clicked, we perform the next-page operation until we reach the last page

            curr_page++;

            if(curr_page<totalPages){
                prev_btn.disabled = false;
                next_btn.disabled = false;

                starlink_dets = await get_all_starlink_satellites(year, month, day, curr_page);
                var docs = starlink_dets.docs;

                var table_data = []

                for(var i=0;i< docs.length; i++){
                    table_data.push(docs[i].spaceTrack);
                }
                BuildTable(table_data);
            }
            else if(curr_page == totalPages){
                next_btn.disabled = true;

                starlink_dets = await get_all_starlink_satellites(year, month, day, curr_page);
                var docs = starlink_dets.docs;

                var table_data = []

                for(var i=0;i< docs.length; i++){
                    table_data.push(docs[i].spaceTrack);
                }
                BuildTable(table_data);
            }
        }
    });
}
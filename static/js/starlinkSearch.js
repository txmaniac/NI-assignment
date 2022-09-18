function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function checkLeap(year){
    return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0));
}

function checkValidDate(year, month, day){

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

async function get_all_starlink_satellites(year, month, day){

    var STARLINK_API = "https://api.spacexdata.com/v4/starlink/query"

    var mongo_query;

    // case 1: if month is not given - Return all the satellites launched in year given $gte -> 01-01-year to $lt -> 01-01-year+1
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
    // case 2: if day is not given - Return all the satellites launched in that month+year given i.e., $gte -> 01-month-year to $lt -> 01-month+1-year

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

    // case 3: if day is given - Return all the satellites launched on that day-month-year given i.e., $eq -> day-month-year

    else{
        var exact_date = year.toString() + "-" + pad(month,2) + "-" + pad(day,2);

        console.log(exact_date);

        mongo_query = {
            "$eq": exact_date
        }

    }

    var query_body = {
        "query": {
            "spaceTrack.LAUNCH_DATE": mongo_query
        },
        "options": {
            "select": {
                "spaceTrack": 1
            }
        }
    };

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

        starlink_dets = await get_all_starlink_satellites(year, month, day);
    });
    
    console.log(starlink_dets);
}
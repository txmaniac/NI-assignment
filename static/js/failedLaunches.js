/**
 * # FIND ALL THE FAILURE LAUNCHES FOR A GIVEN LAUNCH PAD
 *  First find all the launchpads and present them to the user to select the launchpad of choice for which he/she wants to see the results
 *  Perform a search for all the launches done on the selected launchpad such that success == FALSE and fetch the following values.
 *  1. NAME: "NAME OF THE LAUNCH"
 *  2. FAILURE : "REASON FOR FAILURE"
 *  Perform search for all the failures on the given launch pad and present the results.
 * 
 *  STEPS FOR CODING
 *  1. SELECT ALL THE LAUNCHPADS ID's and present them to the user for selection of one.
 *  2. AFTER SELECTION, PERFORM MONGODB QUERY TO FETCH ALL THE LAUNCHES OF A GIVEN LAUNCHPAD FOR WHICH SUCCESS == FALSE.
 *  3. FETCH ONLY THE NAME AND THE FAILURE REASON FOR EVERY SUCH LAUNCH AND COMBINE THEM INTO A NEW ARRAY
 *  4. RETURN THE RESULT OF THE FUNCTION IN THE FOLLOWING FORMAT
 *  
 *  LAUNCH PAD ID
    {
        "LAUNCH PAD NAME": "NAME OF LAUNCHPAD",
        "ALL FAILURES": [
            {
                "NAME": "LAUNCH NAME",
                "REASON": "REASON FOR FAILURE"
            }
            ...
        ]
    }
*/

function createOptions(parent_id, index){
    var parent_tag = document.getElementById(parent_id);
    parent_tag.innerHTML += '<option id=' + '"' + parent_id + index.toLocaleString() + '"' + '></option>';
}

function setOptions(id, name, value){
    var option = document.getElementById(id);
    option.value += value
    option.innerHTML += name
}

async function extractFailures(id){

    var launch_query = `https://api.spacexdata.com/v4/launches/query`;
    var selected_launchpad_name = document.getElementById("launch-pad-select").options[document.getElementById("launch-pad-select").selectedIndex].text

    var query_request = {
        "query": {
            "launchpad": id,
            "success": false
        },
        "options": {
            "select": {
                "failures": 1,
                "name": 1
            },
            "pagination": false
        }
    };

    let failures = await fetch(launch_query, {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify(query_request),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
    })
    .then(async function (response) {
        if(response.status !== 200){
            console.log(`Error : ${response.status}`)
            return;
        }
        var failures = await response.json().then(function (data){
            data = JSON.stringify(data);
            data = JSON.parse(data);

            var docs = data.docs;
            
            var all_failures = [];

            for(doc of docs){
                console.log();
                all_failures.push({
                    "name": doc.name,
                    "failure": doc.failures[0].reason
                });
            }

            var result = {
                "launchpad": selected_launchpad_name,
                "launchpad_id": id,
                "all_failures": all_failures
            };

            return result;
        })

        return failures;
    });

    return failures;
}

async function get_list_of_launchpads(){
    
    var p_tag = document.getElementById('p-tag');
    var select_id = "launch-pad-select"

    LAUNCHPAD_API = `https://api.spacexdata.com/v4/launchpads`

    let launch_dict = await fetch(LAUNCHPAD_API, {
            method: "GET",
            mode: 'cors',
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
    })
    .then(async function (response) {
        if(response.status !== 200){
            console.log(`Error : ${response.status}`)
            return;
        }
        var launchpad_names = await response.json().then(function (data){
            data = JSON.stringify(data);
            data = JSON.parse(data);
            
            var names = new Array(data.length);
            var launchpad_ids = new Array(data.length);
            var pad_to_launches = {}

            for(i=0;i<data.length;i++){
                names[i] = data[i]['name']
                launchpad_ids[i] = data[i]['id']
                pad_to_launches[launchpad_ids[i]] = data[i]['launches']
            }

            return {
                'names': names,
                'ids': launchpad_ids,
                'launches': pad_to_launches
            };
        })
        
        return launchpad_names;
    });
    
    for(i=1; i<=launch_dict.names.length; i++){
        createOptions(select_id, i-1);
    }

    for(i=1; i<=launch_dict.names.length; i++){
        setOptions(select_id + (i-1).toLocaleString(), launch_dict.names[i-1], launch_dict.ids[i-1])
    }

    return launch_dict;
}

function BuildTable(data){

    var table = document.getElementById("result-table");

    table.innerHTML = `<tr>
                        <th>NAME</th>
                        <th>REASON FOR FAILURE</th>
                    </tr>`
    
    if(data.length != 0){
        for(i=0;i < data.length; i++){
            var row = `<tr>
                <td>${data[i].name}</td>
                <td>${data[i].failure}</td>
            </tr>`

            table.innerHTML += row;
        }
    }

    else{
        table.innerHTML = `<p>No records found</p>`;
    }
}

window.onload = async function fetchLaunchpads(){

    var launch_dict = await get_list_of_launchpads();
    
    var form = document.getElementById('launchpad-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        var selected_launchpad_id = document.getElementById("launch-pad-select").value
        
        var failures = await extractFailures(selected_launchpad_id);

        console.log(failures);

        var docs = failures.all_failures;

        console.log(docs);
        BuildTable(docs);
    });
}
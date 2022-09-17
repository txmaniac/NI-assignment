// First find all the launchpads and present them to the user to select the launchpad of choice for which he/she wants to see the results
// Perform a search for all the launches done on the selected launchpad such that success == FALSE and fetch the following values.
// 1. NAME: "NAME OF THE LAUNCH"
// 2. FAILURE : "REASON FOR FAILURE"
// Perform search for all the failures on the given launch pad and present the results.

// STEPS FOR CODING
// 1. SELECT ALL THE LAUNCHPADS ID's and present them to the user for selection of one.
// 2. AFTER SELECTION, PERFORM QUERY TO FETCH ALL THE LAUNCHES FOR WHICH SUCCESS == FALSE.
// 3. FETCH ONLY THE NAME AND THE FAILURE REASON FOR EVERY SUCH LAUNCH AND COMBINE THEM INTO A NEW ARRAY
// 4. RETURN THE RESULT OF THE FUNCTION IN THE FOLLOWING FORMAT
// LAUNCH PAD ID
// {
//     "LAUNCH PAD NAME": "NAME OF LAUNCHPAD",
//     "ALL FAILURES": [
//         {
//             "NAME": "LAUNCH NAME",
//             "REASON": "REASON FOR FAILURE"
//         }
//         ...
//     ]
// }
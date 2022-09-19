# ASSIGNMENT FOR NEVERINSTALL

## PROJECT STRUCTURE
```
	|--Assignment
	|	|-- static
	|	|	|-- css
	|	|	|    |-- failedLaunches.css
	|	|	|    |-- starlink.css
	|	|	|-- js
	|	|	     |-- failedLaunches.js
	|	|	     |-- starlink.js
	|	|-- launches.json
	|	|-- starlink.json
	|	|-- launchpads.json
	|	|-- failedLaunches.html
	|	|-- starlink.html
```

### PROBLEMS DEFINED
#### PROBLEM 1
Find all the failure launches for a given Launchpad using the SPACE-X API.

This function accepts an `id` of a `launchpad` as an argument, and returns information about failed `launches`

##### Assumptions and Technical Decisions:
```
1. Since, the user can't exactly know the ID of the launchpad, I performed two calls to the API.
	1. First one to fetch all the launch pads for the user to choose from
	2. Second one to fetch all the failure launches for the chosen launch pads
2. After going through the SPACE-X API repo, I have also found other API calls which involved response to QUERY POST calls.
The query is a valid MongoDB.find() query. Instead of fetching contents one-by-one (which the given API does [https://api.spacexdata.com/v4/launchpads/]), 
I have used the query API for faster response times.
```

#### PROBLEM 2
Fetch all starlink satellites using SPACE-X-STARLINK API and write a function that transforms the response data.

The return value of this function should make it possible to look up all starlink satellites launched on a specific `year`, `month`, and/or `date` in a performant way.

##### Assumptions and Technical Decisions:
```
1. After going through the SPACE-X API repo, I have also found other API calls which involved response to QUERY POST calls. 
The query is a valid MongoDB.find() query. Instead of fetching all contents (which the given API does [https://api.spacexdata.com/v4/starlink]), 
I have used the query API for faster response times.
2. The date entered must be validated before performing the query. So, in order to find if the entered date is valid or not, 
I have checked the following conditions
	1. Check if year is leap or not
	2. Check for February month incase it's leap year
	3. Pad month and date values to ensure the date is in YYYY-MM-DD format
```
#### TO USE
I have implemented two separate html files for the problems defined. For testing the results, just open the HTML file corresponding to the name of the problem.
```
	1. failedLaunches.html - PROBLEM 1
	2. starlink.html - PROBLEM 2
```

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

#### PROBLEM 2
Fetch all starlink satellites using SPACE-X-STARLINK API and write a function that transforms the response data.

The return value of this function should make it possible to look up all starlink satellites launched on a specific `year`, `month`, and/or `date` in a performant way.


#### TO USE
I have implemented two separate html files for the problems defined. For testing the results, just open the HTML file corresponding to the name of the problem.
```
	1. failedLaunches.html - PROBLEM 1
	2. starlink.html - PROBLEM 2
```

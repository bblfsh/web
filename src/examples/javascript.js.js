export const javascript_example_1 = `  // Set variables
var user = { firstname: "Homer", surname: "Rubble", email: "doh@example.com" };
var output = "";

// Do the loop
for (var prop in user) {
  output += prop + ": " + user[prop] + "<br>";
}

// Output results to the above HTML element
document.getElementById("msg").innerHTML = output;
`;

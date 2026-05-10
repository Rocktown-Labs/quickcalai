import * as Clerk from "@clerk/nextjs";

console.log("Clerk Exports:");
console.log(Object.keys(Clerk).sort().join(", "));

if ("SignedIn" in Clerk) {
  console.log("\nSUCCESS: SignedIn exists in Clerk exports");
} else {
  console.log("\nFAILURE: SignedIn is MISSING from Clerk exports");
}

if ("SignedOut" in Clerk) {
  console.log("SUCCESS: SignedOut exists in Clerk exports");
} else {
  console.log("FAILURE: SignedOut is MISSING from Clerk exports");
}

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api/v1";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWg2YzIyMXYwMDAwMTNzcGo2cXJzOTNiIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzYxNzA3ODU2LCJleHAiOjE3NjE3MTE0NTZ9.jUiQOJ2j4p1Wf1_QK8P8qXsl8heBia4kfJht7EiUF7s";

async function createLeaseForTesting() {
  try {
    console.log("🔍 Fetching listings...");
    const listingsResponse = await axios.get(`${API_BASE_URL}/listings`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const listings = listingsResponse.data.data || listingsResponse.data;
    console.log(`📋 Found ${listings.length} listings:`);
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} (ID: ${listing.id})`);
    });

    if (listings.length === 0) {
      console.log("❌ No listings found. Please create a listing first.");
      return;
    }

    console.log("\n🔍 Fetching users (potential tenants)...");
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    const users = usersResponse.data.data || usersResponse.data;
    const tenants = users.filter((user) => user.role === "TENANT");
    console.log(`👥 Found ${tenants.length} tenants:`);
    tenants.forEach((tenant, index) => {
      console.log(
        `${index + 1}. ${tenant.firstName} ${tenant.lastName} (ID: ${
          tenant.id
        })`
      );
    });

    if (tenants.length === 0) {
      console.log("❌ No tenants found. Please create a tenant user first.");
      return;
    }

    // Use the first listing and first tenant for testing
    const selectedListing = listings[0];
    const selectedTenant = tenants[0];

    console.log(`\n🏠 Creating lease for:`);
    console.log(`   Property: ${selectedListing.title}`);
    console.log(
      `   Tenant: ${selectedTenant.firstName} ${selectedTenant.lastName}`
    );

    const leaseData = {
      listingId: selectedListing.id,
      tenantId: selectedTenant.id,
      startDate: new Date().toISOString().split("T")[0], // Today
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // One year from now
      rentAmount: 1500,
      paymentFrequency: "MONTHLY",
      leaseStatus: "ACTIVE",
      notes: "Test lease for maintenance feature testing",
    };

    const leaseResponse = await axios.post(
      `${API_BASE_URL}/leases`,
      leaseData,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Lease created successfully!");
    console.log(
      "📄 Lease details:",
      JSON.stringify(leaseResponse.data.data, null, 2)
    );
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

createLeaseForTesting();

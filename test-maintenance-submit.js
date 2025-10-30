const axios = require('axios');

async function testMaintenanceSubmit() {
  try {
    // First login to get a token
    const loginResponse = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'landlord@example.com', // Update with actual test email
      password: 'password123' // Update with actual test password
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('Logged in as:', user.email, 'Role:', user.role);
    
    // Get listings
    const listingsResponse = await axios.get('http://localhost:4000/api/v1/listings', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Listings:', listingsResponse.data);
    const firstListing = Array.isArray(listingsResponse.data) 
      ? listingsResponse.data[0] 
      : listingsResponse.data.listing?.[0];
    
    if (!firstListing) {
      console.log('No listings found');
      return;
    }
    
    console.log('Using listing:', firstListing.id, firstListing.title);
    
    // Create maintenance request
    const maintenanceData = {
      title: 'Test Maintenance Request',
      listingId: firstListing.id,
      category: 'PLUMBING',
      priority: 'MEDIUM',
      description: 'This is a test maintenance request with more than 10 characters.'
    };
    
    console.log('Submitting maintenance request:', maintenanceData);
    
    const maintenanceResponse = await axios.post(
      'http://localhost:4000/api/v1/maintenance',
      maintenanceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success!', maintenanceResponse.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testMaintenanceSubmit();

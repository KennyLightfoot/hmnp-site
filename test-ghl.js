const fetch = require('node-fetch');

async function testGhlConnection() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/test-ghl-connection');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testGhlConnection(); 
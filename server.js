const http = require('http');
const url = require('url');
const axios = require('axios');

// Define base URL for Finto API
const baseFintoUrl = 'https://finto.fi/rest/v1/';

// Function to fetch data for a specific ontology
async function fetchOntologyData(ontology, queryParams) {
  const fintoApiUrl = `${baseFintoUrl}${ontology}`;
  try {
    const response = await axios.get(fintoApiUrl, { params: queryParams }); //send all query params to Finto API
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from Finto API for ontology "${ontology}": ${error.message}`);
    throw new Error('Failed to fetch data from Finto API');
  }
}

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const queryParams = parsedUrl.query;

  // Ensure the request path is '/search' for individual ontology fetching
  if (parsedUrl.pathname !== '/search') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint does not exist' }));
    return;
  }

  // 'ontology' parameter (required)
  const { ontology } = queryParams;
  if (!ontology) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing required "ontology" parameter' }));
    return;
  }

  try {
    // Fetch data for the specified ontology
    const ontologyData = await fetchOntologyData(ontology, queryParams);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ontologyData, null, 2)); 
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

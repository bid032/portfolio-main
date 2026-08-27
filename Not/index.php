<?php
// SEO Safety for Googlebot: Send HTTP 503 Service Unavailable Header with 24h Retry-After
header('HTTP/1.1 503 Service Temporarily Unavailable');
header('Status: 503 Service Temporarily Unavailable');
header('Retry-After: 86400'); // Ask search engines to retry in 24 hours

// Render the standalone maintenance page
include('index.html');
?>

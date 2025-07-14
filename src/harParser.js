function validateHar(harJson) {
  if (!harJson?.log?.entries) {
    throw new Error('Invalid HAR file format - missing log.entries');
  }
}

// Helper to handle domain-specific cookies
function getCookieHeader(jar, url) {
  try {
    const domain = new URL(url).hostname;
    const cookies = jar.get(domain) || [];
    return cookies.join('; ');
  } catch (e) {
    return null;
  }
}

// Extract Set-Cookie headers and update jar
function extractResponseCookies(headers, jar) {
  headers.forEach(header => {
    if (header.name.toLowerCase() === 'set-cookie') {
      const cookieData = header.value.split(';')[0];  // Simple extraction of key=value
      const domainMatch = /domain=([^;]+)/i.exec(header.value);
      const domain = domainMatch ? domainMatch[1].toLowerCase() : '*';
      
      if (!jar.has(domain)) jar.set(domain, []);
      jar.get(domain).push(cookieData);
    }
  });
}

exports.parseHar = (harJson, { cleanCookies = false } = {}) => {
  validateHar(harJson);
  
  const cookieJar = new Map();  // Tracks cookies per domain
  return harJson.log.entries.map((entry, index) => {
    // Start with existing headers
    let requestHeaders = [...entry.request.headers];
    
    // Conditionally remove original Cookie headers
    if (cleanCookies) {
      requestHeaders = requestHeaders.filter(header => 
        header.name.toLowerCase() !== 'cookie'
      );
    }
    
    // Get cookies for this request's domain
    const cookieHeader = getCookieHeader(cookieJar, entry.request.url);
    if (cookieHeader) {
      requestHeaders.push({ name: 'Cookie', value: cookieHeader });
    }
    
    // Update cookie jar from response headers
    extractResponseCookies(entry.response.headers, cookieJar);

    return {
      id: index + 1,
      url: entry.request.url,
      method: entry.request.method,
      requestBody: entry.request.postData?.text,
      requestHeaders: requestHeaders.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {}),
      status: entry.response.status,
      responseHeaders: entry.response.headers.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {}),
      responseBody: entry.response.content.text
    };
  });
};
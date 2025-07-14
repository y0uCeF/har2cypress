function validateHar(harJson) {
  if (!harJson?.log?.entries) {
    throw new Error('Invalid HAR file format - missing log.entries');
  }
}

exports.parseHar = (harJson) => {
  validateHar(harJson);
  return harJson.log.entries.map((entry, index) => ({
    id: index + 1,
    url: entry.request.url,
    method: entry.request.method,
    requestBody: entry.request.postData?.text,  // Capture request body with null safety
    requestHeaders: entry.request.headers.reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {}),
    status: entry.response.status,
    responseHeaders: entry.response.headers.reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {}),
    responseBody: entry.response.content.text
  }));
};

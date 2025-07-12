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
    status: entry.response.status,
    headers: entry.response.headers.reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {}),
    body: entry.response.content.text
  }));
};

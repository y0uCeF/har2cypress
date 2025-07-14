const { v4: uuidv4 } = require('uuid');

exports.generateSpec = (requests) => {
  const testId = uuidv4().substring(0, 8);
  return `// Auto-generated test spec from HAR file
/// <reference types="cypress" />
describe('HAR-generated tests ${testId}', () => {
  ${requests.map(req => `
  it('${req.method} ${req.url}', () => {
    cy.intercept('${req.method}', '${req.url}').as('apiRequest');
    
    cy.request({
      method: '${req.method}',
      url: '${req.url}',
      headers: ${JSON.stringify(req.requestHeaders)},
      ${req.requestBody ? `body: ${JSON.stringify(req.requestBody, null, 2)},` : ''}
      failOnStatusCode: false
    });

    cy.wait('@apiRequest').then((interception) => {
      cy.wrap(interception.response.statusCode).should('eq', ${req.status});
      cy.wrap(interception.response.headers).should('deep.include', ${JSON.stringify(req.headers, null, 2)});
      // Test response headers - deep.include checks for expected headers but allows extra ones
      cy.wrap(interception.response.headers).should('deep.include', ${JSON.stringify(req.responseHeaders, null, 2).replace(/\n/g, '\\n')});
      cy.wrap(interception.response.body).should('deep.eq', ${JSON.stringify(req.responseBody, null, 2)});
    });
  });`).join('\n')}
});
`;
};

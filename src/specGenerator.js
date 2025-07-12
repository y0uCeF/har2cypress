const { v4: uuidv4 } = require('uuid');

exports.generateSpec = (requests) => {
  const testId = uuidv4().substring(0, 8);
  return `// Auto-generated test spec from HAR file
/// <reference types="cypress" />
describe('HAR-generated tests ${testId}', () => {
  ${requests.map(req => `
  it('${req.method} ${req.url}', () => {
    cy.intercept('${req.method}', '${req.url}', {
      statusCode: ${req.status},
      headers: ${JSON.stringify(req.headers, null, 2)},
      body: ${JSON.stringify(req.body, null, 2)}
    }).as('req${req.id}');
    
    cy.visit('${req.url}');
    cy.wait('@req${req.id}').then((interception) => {
      expect(interception.response.statusCode).to.eq(${req.status});
    });
  });`).join('\n')}
});
`;
};

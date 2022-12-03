describe("Online Play", () => {
    it("should work online",() => {
      cy.visit("http://localhost:3000/");
      cy.get("button").contains("Online").click();

      cy.get("h3").contains("Waiting for an opponent...")
      cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
      cy.get("h3").contains("BLUE")
      
    })
  })
describe("Navigation", () => {
  it("should work locally, and it should disable click after a game is won.", () => {
    cy.visit("http://localhost:3000/");

    cy.get("button").contains("Local").click();
    /* Enter first Local game, red should win */
    cy.get("h3").contains("It is RED's turn");
    let repeat = 3;
    while (repeat-- > 0) {
      cy.get("#hole41").trigger("mouseover").click();
      cy.wait(300);
      cy.get("#hole35").trigger("mouseover").click();
      cy.wait(300);
    }
    cy.get("#hole41").trigger("mouseover").click();
    cy.get("h1").contains("THE GAME IS WON! RED WINS!");
    cy.get("button").contains("Leave Game").click();
    cy.get("button").contains("Local").click();
    /* Enter second Local game, blue should win */
    cy.get("h3").contains("It is RED's turn");
    repeat = 3;
    cy.get("#hole40").trigger("mouseover").click();
    cy.wait(300);
    while (repeat-- > 0) {
      cy.get("#hole35").trigger("mouseover").click();
      cy.wait(300);
      cy.get("#hole41").trigger("mouseover").click();
      cy.wait(300);
    }
    cy.get("#hole35").trigger("mouseover").click();
    cy.get("h1").contains("THE GAME IS WON! BLUE WINS!");
    /* Ensure that clicking again does nothing */
    cy.wait(300);
    cy.get("#hole41").trigger("mouseover").click();
    cy.get("#piece8").should("not.exist");
  });
});

export {};

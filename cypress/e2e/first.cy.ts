
describe("Online Play", () => {
  it("should work online",() => {
    cy.visit("http://localhost:3000/");
    cy.get("button").contains("Online").click();
    
    cy.get("h3").contains("Waiting for an opponent...")
    /* Set Alias for Chat */
    cy.get("input[placeholder='Your name']").type("firstUser")
    cy.get("button").contains("Set Name").click()
    /* Set Name button changes to Send button */
    cy.get("button").contains("Send")
    
    /* Player Two enters */
    cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
    /* Send a message */
    cy.get("input[placeholder='Type something']").type("GLHF{enter}")
    cy.get("div").contains("Me: GLHF")
    
    /* Check the forfeit button */
    cy.get("button").contains("Forfeit").should("exist")

    /* Red will win the game */
    let repeat = 4;
    while (repeat-- > 0){
      cy.get("h3").contains("It is RED's turn").should("exist")
      cy.get("#hole41").trigger("mouseover").click();
      cy.wait(300)
    }
    /* Game Over message is correct */
    cy.get("h1").contains("THE GAME IS WON! RED WINS!")
    /* Receive a message after the game is won */
    cy.get("div").contains("secondUser: gg")

    /* Leave the chat */
    cy.get("button").contains("Leave Chat").click()
    cy.get("button").contains("Leave Game").click()
    /* End up on the front page */
    cy.get("h1").contains("Kinect Fore!")
  })

  it("should correctly forfeit during a game", () => {
    cy.get("button").contains("Play Online").click()
    cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
    cy.get("button").contains("Forfeit").click()
    cy.get("h1").contains("THE GAME IS WON! BLUE WINS!")
    cy.get("button").contains("Leave Game").click()

  })
  
  it("should dismantle a room if a player forcefully disconnects", () => {
    cy.get("button").contains("Play Online").click()
    cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
    cy.visit("http://localhost:3000/")
  })

  it("should correctly dismantle a room if a player leaves before finding a match", () => {
    cy.get("button").contains("Play Online").click()
    cy.get("button").contains("Leave Game").click()
    cy.get("button").contains("Play Online").click()
    cy.get("h3").contains("Waiting for an opponent...")
    cy.wait(1000)
    cy.get("h3").contains("Waiting for an opponent...")
    cy.get("button").contains("Leave Game").click()
  })


})

describe("Local Play", () => {
  it("should work locally", () => {
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
  })

  it("should allow blue to win if blue wins", () => {
    /* Enter second Local game, blue should win */
    cy.get("h3").contains("It is RED's turn");
    let repeat = 3;
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
  })

  it("should disable clicking when a game is finished", () => {
    /* Ensure that clicking again does nothing */
    cy.wait(300);
    cy.get("#hole41").trigger("mouseover").click();
    cy.get("#piece8").should("not.exist");
    /* Exit back to home*/
    cy.get("button").contains("Leave Game").click()
  })

  it("should prevent more than 6 pieces being place on one column", () => {
    cy.get("button").contains("Play Local").click()
    let repeat = 3;
    while (repeat-- > 0) {
      cy.get("#hole38").trigger("mouseover").click();
      cy.wait(300);
      cy.get("#hole38").trigger("mouseover").click();
      cy.wait(300);
    }
    cy.get("#hole38").trigger("mouseover").click()
    cy.wait(300)
    cy.get("h3").contains("It is RED's turn")
  })

  it("should trigger a tie when 42 pieces exist and no one has won", () => {
    function fillCols(col1:number, col2:number) {
      let repeat = 3;
      while (repeat-- > 0) {
        cy.get(`#hole${col1}`).trigger("mouseover").click();
        cy.wait(300);
        cy.get(`#hole${col2}`).trigger("mouseover").click();
        cy.wait(300);
      }
      repeat = 3
      while (repeat-- > 0) {
        cy.get(`#hole${col2}`).trigger("mouseover").click();
        cy.wait(310);
        cy.get(`#hole${col1}`).trigger("mouseover").click();
        cy.wait(300);
      }
    }
    fillCols(2,4)
    fillCols(5,1)
    fillCols(0,6)
    cy.get("h1").contains("THE GAME IS OVER!")
  })

});
export {};

describe("Online Play", () => {
    it("should work online",() => {
      cy.visit("http://localhost:3000/");
      cy.get("button").contains("Online").click();

      cy.get("h3").contains("Waiting for an opponent...")
      /* Set Alias for Chat */
      cy.get("input[placeholder='Your name']").type("secondUser")
      cy.get("button").contains("Set Name").click()
      
      cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
      cy.get("h3").contains("BLUE")
      /* Receive a message */
      cy.get("div").contains("firstUser: GLHF")

      let repeat = 3;
      while (repeat-- > 0) {
        cy.contains("It is BLUE's turn")
        cy.get("#hole35").trigger("mouseover").click();
        cy.wait(300)
      }

      /* Send a message after the game is won */
      cy.get("input[placeholder='Type something']").type("gg{enter}")
      cy.get("div").contains("Me: gg")
      /* Receive correct game over message */
      cy.get("h1").contains("THE GAME IS WON! RED WINS!")
      /* Leave button receives disconnect from firstUser */
      cy.get("button").contains("Leave Chat")
      cy.get("button").contains("Leave Chat").should("not.exist")
      cy.get("button").contains("Leave Game").click()
    })

    it("should correctly receive another player's forfeit, and chatToggle should work", () => {
      cy.wait(1000)
      cy.get("h1").contains("Kinect Fore!")
      cy.get("button").contains("Play Online").click()
      cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
      /* Test Chat Toggle */
      cy.get("#chatToggle").click()
      cy.get("#chat[style='left: 73%;']").should("exist")
      cy.get("#chatToggle").click()
      cy.get("#chat[style='left: 100%;']").should("exist")
      /* Correct game over message is displayed */
      cy.get("h1").contains("THE GAME IS WON! BLUE WINS!")
      cy.get("button").contains("Leave Game").click()
    })

    it("should correctly receive and deal with opponent forcefully disconnecting", () => {
      cy.wait(1000)
      cy.get("button").contains("Play Online").click()
      cy.get("h3").contains("Waiting for an opponent...").should("not.exist")
      cy.get("h1").contains("YOUR OPPONENT DISCONNECTED")
      cy.get("button").contains("Leave Game").click()
    })
  })

export {}
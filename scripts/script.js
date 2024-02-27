function init() {
  let start = document.querySelector("#start");
  let hit = document.querySelector("#hit");
  let stand = document.querySelector("#stand");
  let split = document.querySelector("#split");
  let doubleDown = document.querySelector("#DD");
  let newBet = document.querySelector("#new-bet");
  let playerDisplay = document.querySelector(".player-cards");
  let cardsContainer = document.querySelector(".cards-container");
  let compContainer = document.querySelector(".comp-container");
  let pScoreCount = document.querySelector(".pScore");
  let gamestageMsg = document.querySelector(".gamestage-message");
  let cScore = document.querySelector(".cScore");
  let compGamestageMsg = document.querySelector(".comp-gamestage-message");
  let playerBtns = document.querySelectorAll(".pbtns");

  let storeGameData = {
    playerScore: 0,
    compScore: 0,
  }

  let deckID;
  let deckData = {
    deckID: "",
    data: '',

  }
  let gameStatus = false;

  let playerGameState;
  let playerCardDist = 0;
  let playerCredits = 100000;
  const playerHand = [];

  let compGameState;
  let cardDist = 0;
  const compHand = [];

  window.onload = () => {
    displayCredits();
    getDeckData();
  };

  async function getDeckData() {
    try {
      let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=3");
      let data = await response.json();

      deckData.deckID = data.deck_id;
      console.log(deckData.deckID)
    } catch (error) {
      console.log("Error shuffling:", error);
    }
  }

  start.onclick = async function () {
    try {
      await printCompCards();
      await printPlayerCards();
      await printCompCards();
      await printPlayerCards();

    } catch (error) {
      console.log(error);
    }
  }

  hit.onclick = async function () {
    try {

      printPlayerCards();


    } catch (error) {
      console.log(error);
    }

  }

  function getValueByCardType(cardType) {
    if (cardType > 1 && cardType < 10) {
      return cardType;
    }

    switch (cardType) {
      case "10":
      case "JACK":
      case "QUEEN":
      case "KING":
        return 10;
      case "ACE":
        return (storeGameData.playerScore + 11 > 21) ? 1 : 11;
    }
  }

  async function printPlayerCards() {
    if (!deckData.deckID) {
      console.error("Deck ID is not set.");
      return;
    }

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let playerCards = drawData.cards;

    playerCards.forEach(card => {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png";

      card.bjVal = getValueByCardType(card.value)

      playerHand.push(card)
      countScore("player");

      let cardElem = document.createElement("div");
      cardElem.classList.add("card-face");
      cardElem.innerHTML =
        `
      <img src=${card.image} alt="">
    `;

      cardElem.style.left = playerCardDist + "px";
      playerCardDist += 17;


      cardsContainer.appendChild(cardElem);
      fadeIn(cardElem);
      console.log(playerHand);
      console.log(`Player ${storeGameData.playerScore}`);
    })
  }

  async function printCompCards() {
    let compContainer = document.querySelector(".comp-container");

    if (!deckData.deckID) {
      console.error("Deck ID is not set.");
      return;
    }

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckData.deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let compCards = drawData.cards;


    compCards.forEach(card => {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png";

      card.bjVal = getValueByCardType(card.value);

      compHand.push(card);
      countScore("comp");

      if (compHand.length < 2 || compHand.length > 2) {
        let cardElem = document.createElement("div");
        cardElem.classList.add("card-face");
        cardElem.innerHTML =
          `
      <img src=${card.image} alt="">
        `;

        cardElem.style.left = cardDist + "px";
        cardDist += 17;


        compContainer.appendChild(cardElem);
      } else if (compHand.length === 2) {
        let cardElem = document.createElement("div");
        cardElem.classList.add("card-face");
        cardElem.innerHTML =
          `
           <img src=${card.backImage} alt="">
            `;

        cardElem.style.left = cardDist + "px";
        cardDist += 17;

        compContainer.appendChild(cardElem);
        console.log(compHand);
        console.log(`comp ${storeGameData.compScore}`);
      }
    })
  }

  function countScore(x) {
    if (x === "player") {
      storeGameData.playerScore = 0;

      playerHand.forEach(card => {
        storeGameData.playerScore += Number(card.bjVal);
        pScoreCount.innerHTML = storeGameData.playerScore;

        if (storeGameData.playerScore > 21) {
          gamestageMsg.innerHTML = "BUST";
        } else if (storeGameData.playerScore === 21) {
          gamestageMsg.innerHTML = "WIN";
        }
      })
    } else if (x === "comp") {

      storeGameData.compScore = 0;

      compHand.forEach((card, index) => {
        if (index !== 1) {
          if (card.value !== "ACE") {
            storeGameData.compScore += Number(card.bjVal);
          } else {
            if (storeGameData.compScore + Number(card.bjVal11) > 21) {
              storeGameData.compScore += Number(card.bjVal1)
            } else if (storeGameData.compScore + card.bjVal11 <= 21) {
              storeGameData.compScore += Number(card.bjVal11)
            }
          }

          cScore.innerHTML = storeGameData.compScore;

        }
      })
    }
  }

  function displayCredits() {
    let totalCredits = document.querySelector(".total-credits");
    let innerDiv = totalCredits.firstElementChild;

    innerDiv.innerHTML = `Total Credits: ${playerCredits}`;
  }

  function fadeIn(element) {
    element.style.opacity = 0;
    var opacity = 0;
    var timer = setInterval(function () {
      if (opacity >= 1) {
        clearInterval(timer);
      }
      element.style.opacity = opacity;
      opacity += 0.1;
    }, 50);
  }

  stand.onclick = function () {
    playerBtns.forEach(btn => {
      btn.classList.add("unclick");
      btn.onclick = null;
    })
    showSecondCard();
    pressStand(storeGameData.playerScore, storeGameData.compScore);
  }

  async function pressStand(playerScore, compScore) {

    if (compScore <= 16) {
      await drawCompCards(playerScore, compScore);
    }
  }

  async function showSecondCard() {
    let compSecondCard = compContainer.children[1];
    let secondCardImage = compHand[1].image;
    let cScore = document.querySelector(".cScore");

    compSecondCard.innerHTML = '';

    await printCompCards().then(() => {

      compSecondCard.innerHTML += `<img src=${secondCardImage} alt="">`;
      storeGameData.compScore += +compHand[1].bjVal;
      cScore.textContent = storeGameData.compScore;
      console.log(storeGameData.compScore)
    })
  }

  async function drawCompCards(playerS, compS) {
    async function drawCard() {
      await printCompCards();
      compS = storeGameData.compScore;
    }

    await showSecondCard(0);

    while (compS <= 16 && storeGameData.compScore < 21) {
      await drawCard();

      if (storeGameData.compScore >= 17 && storeGameData.compScore < 21) {
        if (playerS > compS && compS < 21) {
          compGamestageMsg.innerHTML = 'Lose';
          gamestageMsg.innerHTML = 'Win';
        } else if (playerS < compS) {
          compGamestageMsg.innerHTML = 'Win';
          gamestageMsg.innerHTML = 'Lose';
        }
      }
    }


  }

}
init()
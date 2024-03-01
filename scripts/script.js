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
  let pScore = document.querySelector(".pScore");
  let cScore = document.querySelector(".cScore");
  let gamestageMsg = document.querySelector(".gamestage-message");
  let compGamestageMsg = document.querySelector(".comp-gamestage-message");
  let playerBtns = document.querySelectorAll(".pbtns");

  let gameData = {
    playerScore: 0,
    playerScoreArray: [],
    playerCardDist: 0,
    playerGameState: "NULL",


    compScore: 0,
    compScoreArray: [],
    compCardDist: 0,
    compGameState: "NULL",

    standClicked: false,
    finalDraw: false,
  }

  let deckData = {
    deckID: "",
    data: '',
  }

  let playerCredits = 100000;
  const playerHand = [];
  const compHand = [];

  window.onload = () => {
    getDeckData();
    displayCredits();
  };

  doubleDown.onclick = function () {
    console.log(gameData.compGameState, "CGS");
    console.log(gameData.playerGameState, "PGS");
  }

  stand.addEventListener("click", pressStandButton);
  hit.addEventListener("click", pressHitButton);

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

  async function pressHitButton() {
    try {
      await printPlayerCards();
      setGameState("player");

      gameData.compGameState = getWinnerData(gameData.playerGameState);
    } catch (error) {
      console.log(error);
    }
  }

  function getValueByCardType(cardType, user) {
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
        if (user === "player") {
          return (gameData.playerScore + 11 > 21) ? 1 : 11;
        } else {
          return (gameData.compScore + 11 > 21) ? 1 : 11;
        }

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

    for (let card of playerCards) {
      card.backImage = "https://deckofcardsapi.com/static/img/back.png";
      card.bjVal = getValueByCardType(card.value, "player");

      gameData.playerScoreArray.push(+card.bjVal);

      playerHand.push(card);
      countUserScore("player");

      let cardElem = document.createElement("div");
      cardElem.classList.add("card-face");
      cardElem.style.opacity = 0;
      cardElem.innerHTML =
        `
      <img src=${card.image} alt="">
  `;

      cardElem.style.left = gameData.playerCardDist + "px";
      gameData.playerCardDist += 17;

      cardsContainer.appendChild(cardElem);
      await delay(100);
      fadeIn(cardElem);
    }
    setGameState("player")
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


    for (let card of compCards) {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png";
      card.bjVal = getValueByCardType(card.value, "comp");

      gameData.compScoreArray.push(+card.bjVal);
      console.log(gameData.compScoreArray, "CScoreArr");

      compHand.push(card);

      if (compHand.length < 2 || compHand.length > 2) {

        let cardElem = document.createElement("div");
        cardElem.classList.add("card-face");
        cardElem.style.opacity = 0;
        cardElem.innerHTML =
          `
      <img src=${card.image} alt="">
        `;

        cardElem.style.left = gameData.compCardDist + "px";
        gameData.compCardDist += 17;


        compContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem);

      } else if (compHand.length === 2) {

        let cardElem = document.createElement("div");
        cardElem.classList.add("card-face");
        cardElem.style.opacity = 0;
        cardElem.innerHTML =
          `
           <img src=${card.backImage} alt="">
            `;

        cardElem.style.left = gameData.compCardDist + "px";
        gameData.compCardDist += 17;

        compContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem);
      }
      setGameState("comp")
    }
    countUserScore("comp");

  }

  function countUserScore(user) {
    if (user === "player") {
      let pCount = 0;
      gameData.playerScoreArray.forEach((item) => {


        pCount += +item
        gameData.playerScore = +pCount
        pScore.innerHTML = gameData.playerScore;

      })
    } else {
      let cCount = 0;
      gameData.compScoreArray.forEach((item) => {
        if (gameData.standClicked) {

          cCount += +item;
          gameData.compScore = +cCount;
          cScore.innerHTML = gameData.compScore;

        } else {

          cScore.innerHTML = gameData.compScoreArray[0];

        }

      })
    }
    setGameState(user);
  }

  function displayCredits() {
    let totalCredits = document.querySelector(".total-credits");
    let innerDiv = totalCredits.firstElementChild;

    innerDiv.innerHTML = `Total Credits: ${playerCredits}`;
  }

  function fadeIn(element) {
    element.style.opacity = 0;
    let opacity = 0;
    let timer = setInterval(function () {
      if (opacity >= 1) {
        clearInterval(timer);
      }
      element.style.opacity = opacity;
      opacity += 0.1;
    }, 50);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function pressStandButton() {
    let compSecondCard = compContainer.children[1];

    compSecondCard.innerHTML = '';

    let cardElem = document.createElement("img");
    cardElem.src = compHand[1].image;
    cardElem.style.opacity = 0;
    await delay(100);
    fadeIn(cardElem);
    compSecondCard.append(cardElem);
    gameData.standClicked = true;
    countUserScore("comp");

    while (gameData.compScore <= 16) {

      await delay(500);
      await printCompCards();
      setGameState("player");
      setGameState("comp");

      if (gameData.compScore >= 17) {
        gameData.finalDraw = true;
        break;
      }
    }

    gameData.playerGameState = getWinnerData(gameData.compGameState);
    gameData.compGameState = getWinnerData(gameData.playerGameState);
  }

  function setGameState(user) {
    if (user === "player") {
      gameData.playerGameState = scoreLogicSetter(gameData.playerScore, gameData.compScore, gameData.standClicked);
    } else {
      gameData.compGameState = scoreLogicSetter(gameData.compScore, gameData.playerScore, gameData.standClicked);
    }
  }

  function scoreLogicSetter(userScore, opponentScore, clicked) {
    if (clicked) {
      if (userScore > 21 || userScore < opponentScore) {
        return "BUST";
      } else if (userScore === 21) {
        return "BLACKJACK";
      } else if (userScore > opponentScore && userScore < 21) {
        return "WIN";
      } else if (userScore === opponentScore) {
        return "DRAW";
      }
    } else {
      if (userScore > 21) {
        return "BUST"
      } else if (userScore === 21) {
        return "BLACKJACK"
      }
    }
  }

  function getWinnerData(opponentState) {
    if (opponentState === "BUST") {
      return "WIN";
    } else if (opponentState === "WIN") {
      return "BUST";
    }
  }


}
init()
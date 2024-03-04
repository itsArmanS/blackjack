function init() {
  let hit = document.querySelector("#hit");
  let stand = document.querySelector("#stand");
  let split = document.querySelector("#split");
  let doubleDown = document.querySelector("#DD");
  let placeBet = document.querySelector("#place-bet");
  let playerDisplay = document.querySelector(".player-cards");
  let cardsContainer = document.querySelector(".cards-container");
  let compContainer = document.querySelector(".comp-container");
  let pScore = document.querySelector(".pScore");
  let cScore = document.querySelector(".cScore");
  let gamestageMsg = document.querySelector(".gamestage-message");
  let compGamestageMsg = document.querySelector(".comp-gamestage-message");
  let playerBtns = document.querySelectorAll(".pbtns");
  let betDisplay = document.querySelector(".bet-display");
  let subtractBet = document.querySelector(".minus-bet");
  let addBet = document.querySelector(".plus-bet");
  let betButtons = document.querySelectorAll(".bet-btns");

  let gameData = {
    playerCredits: 1000,
    playerScore: 0,
    playerHand: [],
    playerScoreArray: [],
    playerCardDist: 0,
    playerGameState: "",


    compScore: 0,
    compHand: [],
    compScoreArray: [],
    compCardDist: 0,
    compGameState: "",

    deckID: "",
    standClicked: false,
    finalDraw: false,
    roundEnded: false,
    currentBet: 0,
    minimumBet: 50,
  }

  window.onload = () => {
    getDeckData();
    displayCredits();
    enableButtons("bet");
    disableButtons("player");
  };

  placeBet.addEventListener("click", pressPlaceBetButton);

  cardsContainer.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    console.log(gameData.compGameState, "CGS");
    console.log(gameData.playerGameState, "PGS");
    newRoundTimer();
  });


  async function getDeckData() {
    try {
      let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=3");
      let data = await response.json();

      gameData.deckID = data.deck_id;
      console.log(gameData.deckID)
    } catch (error) {
      console.log("Error shuffling:", error);
    }
  }

  async function startGame() {
    try {
      displayCurrentBet();
      await printCompCards();
      await printPlayerCards();
      await printCompCards();
      await printPlayerCards();

      if (gameData.playerScore === 21) {
        setGameState("player");
        setGameState("comp");
        gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);
        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
        gameData.playerCredits += gameData.currentBet;
        displayCredits();
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function pressHitButton() {
    try {
      await printPlayerCards();

      if (gameData.finalDraw) {
        setGameState("player");
        setGameState("comp");
        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
        gameData.playerCredits += gameData.currentBet;
      }

      gameData.playerGameState = getWinnerData(gameData.compGameState, gameData.playerGameState);
      gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);

    } catch (error) {
      console.log(error);
    }
  }

  async function pressStandButton() {

    disableButtons("all");
    await handleSecondCard();

    while (gameData.compScore <= 16 && gameData.compScore <= gameData.playerScore) {

      await delay(500);
      await printCompCards();
      setGameState("player");
      setGameState("comp");

      if (gameData.compScore >= 17) {
        gameData.finalDraw = true;
        gameData.roundEnded = true;
        setGameState("player");
        setGameState("comp");
        break;
      }
    }

    gameData.playerGameState = getWinnerData(gameData.compGameState, gameData.playerGameState);
    gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);
    gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
    gameData.playerCredits += +gameData.currentBet;
    displayCredits();

  }

  async function pressDoubleDownButton() {
    gameData.currentBet *= 2;
    gameData.playerCredits -= gameData.currentBet / 2;
    displayCredits();
    pressStandButton();
  }

  async function pressPlaceBetButton() {
    if (gameData.currentBet === 0) {
      alert("Place a bet first!");
    } else {

      disableButtons("bet");
      gameData.playerCredits -= gameData.currentBet;
      displayCredits();

      await startGame();
      await delay(100);
      enableButtons("player");
    }
  }

  function disableButtons(button) {
    if (button === "bet") {
      betButtons.forEach(button => {
        button.onclick = null;
        button.classList.add("unclick")
      })
    } else if (button === "player") {
      playerBtns.forEach(button => {
        button.onclick = null;
        button.classList.add("unclick")
      })
    } else if (button === "all") {
      betButtons.forEach(button => {
        button.onclick = null;
        button.classList.add("unclick")
      })
      playerBtns.forEach(button => {
        button.onclick = null;
        button.classList.add("unclick")
      })
    }
  }

  function enableButtons(button) {
    if (button === "bet") {
      betButtons.forEach(button => {
        button.classList.remove("unclick");
      })
      placeBet.addEventListener("click", pressPlaceBetButton);
      addBet.addEventListener("click", function () {
        gameData.currentBet = changeBet(gameData.currentBet, "add", gameData.minimumBet);
        betDisplay.innerHTML = gameData.currentBet;
      });
      subtractBet.addEventListener("click", function () {
        gameData.currentBet = changeBet(gameData.currentBet, "subtract", gameData.minimumBet);
        betDisplay.innerHTML = gameData.currentBet;

      });
    } else if (button === "player") {
      playerBtns.forEach(button => {
        button.classList.remove("unclick");
      })
      stand.addEventListener("click", pressStandButton);
      hit.addEventListener("click", pressHitButton);
      doubleDown.addEventListener("click", pressDoubleDownButton);
    } else if (button === "all") {
      playerBtns.forEach(button => {
        button.classList.remove("unclick");
      })
      stand.addEventListener("click", pressStandButton);
      hit.addEventListener("click", pressHitButton);
    }
  }

  function changeBet(currentBet, operation, minimumBet) {
    if (operation === "add") {
      if (currentBet === 0) {
        currentBet += minimumBet
      } else {
        currentBet += minimumBet;
        if (currentBet > gameData.playerCredits) {
          currentBet = gameData.playerCredits
        }
      }
    } else {
      if (currentBet === 0) {
        currentBet = 0;
      } else {
        currentBet -= minimumBet;
        if (currentBet < minimumBet) {
          currentBet = minimumBet;
        }
      }
    }
    return currentBet;
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
    if (!gameData.deckID) {
      console.error("Deck ID is not set.");
      return;
    }

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameData.deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let playerCards = drawData.cards;

    for (let card of playerCards) {
      card.backImage = "https://deckofcardsapi.com/static/img/back.png";
      card.bjVal = getValueByCardType(card.value, "player");

      gameData.playerScoreArray.push(+card.bjVal);

      gameData.playerHand.push(card);
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

    if (!gameData.deckID) {
      console.error("Deck ID is not set.");
      return;
    }

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameData.deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let compCards = drawData.cards;


    for (let card of compCards) {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png";
      card.bjVal = getValueByCardType(card.value, "comp");

      gameData.compScoreArray.push(+card.bjVal);
      console.log(gameData.compScoreArray, "CScoreArr");

      gameData.compHand.push(card);

      if (gameData.compHand.length < 2 || gameData.compHand.length > 2) {

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

      } else if (gameData.compHand.length === 2) {

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

    betDisplay.innerHTML = 0;
    innerDiv.innerHTML = `Total Credits: ${gameData.playerCredits}`;

    let bet = gameData
    displayCurrentBet();
  }

  function displayCurrentBet() {
    let currentBetDisplay = document.querySelector(".current-bet");
    let innerDiv = currentBetDisplay.firstElementChild;

    if (gameData.roundEnded) {
      innerDiv.innerHTML = `You Won: ${gameData.currentBet}`
    } else {
      if (gameData.currentBet > 0) {
        innerDiv.innerHTML = `Current Bet: ${gameData.currentBet}`
      } else {
        innerDiv.innerHTML = `Current Bet: ${0}`
      }
    }
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

  async function handleSecondCard() {
    let compSecondCard = compContainer.children[1];

    compSecondCard.innerHTML = '';

    let cardElem = document.createElement("img");
    cardElem.src = gameData.compHand[1].image;
    cardElem.style.opacity = 0;

    await delay(100);
    fadeIn(cardElem);
    compSecondCard.append(cardElem);

    gameData.standClicked = true;
    countUserScore("comp");
  }

  function setGameState(user) {
    if (user === "player") {
      gameData.playerGameState = stateLogicSetter(gameData.playerScore, gameData.compScore, gameData.standClicked);
    } else {
      gameData.compGameState = stateLogicSetter(gameData.compScore, gameData.playerScore, gameData.standClicked);
    }
  }

  function stateLogicSetter(userScore, opponentScore, clicked) {
    if (clicked) {
      if (userScore > 21 || userScore < opponentScore) {
        return "BUST";
      } else if (userScore === 21) {
        return "WIN";
      } else if (userScore > opponentScore && userScore < 21) {
        return "WIN";
      } else if (userScore === opponentScore) {
        return "DRAW";
      }
    } else {
      if (userScore > 21) {
        return "BUST"
      } else if (userScore === 21) {
        return "WIN"
      }
    }
  }

  function getWinnerData(opponentState, userState) {
    if (opponentState === "BUST") {
      return "WIN";
    } else if (opponentState === "WIN") {
      return "BUST";
    } else if (opponentState === "DRAW") {
      return "DRAW";
    }
    gamestageMsg.innerHTML = userState;
  }

  function decideBetReturn(userState, opponentState) {
    if (userState === "WIN" || opponentState === "BUST") {
      return 2.5;
    } else if (userState === "WIN" && opponentState === "WIN") {
      return 0;
    } else if (userState === "BUST" || opponentState === "WIN") {
      return 0;
    } else if (userState === "DRAW" && opponentState === "DRAW") {
      return 1;
    }
  }

  function resetGameData() {
    gameData.playerHand = [];
    gameData.playerScore = 0;
    gameData.playerGameState = '';
    gameData.playerScoreArray = [];
    gameData.playerCardDist = 0;

    gameData.compHand = [];
    gameData.compScore = 0;
    gameData.compGameState = '';
    gameData.compScoreArray = [];
    gameData.compCardDist = 0;

    gameData.standClicked = false;
    gameData.finalDraw = false;
    gameData.roundEnded = false;
    gameData.currentBet = 0;

    cardsContainer.innerHTML = "";
    compContainer.innerHTML = "";
  }

  function newRoundTimer() {
    if (gameData.roundEnded) {
      let roundTimerDisplay = document.querySelector(".round-timer");
      let innerDiv = roundTimerDisplay.firstElementChild;
      let count = 3;

      roundTimerDisplay.style.display = "flex";

      innerDiv.innerHTML = `New round in ${count}`;

      let countdownInterval = setInterval(() => {
        count--;
        innerDiv.innerHTML = `New round in ${count}`;

        if (count === 0) {
          clearInterval(countdownInterval);
          roundTimerDisplay.style.display = "none";
          resetGameData();
        }
      }, 1000);

      enableButtons("bet");
    }
  }
}
init()
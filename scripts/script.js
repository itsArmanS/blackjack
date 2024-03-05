function init() {
  let hit = document.querySelector("#hit");
  let stand = document.querySelector("#stand");
  let split = document.querySelector("#split");
  let doubleDown = document.querySelector("#DD");
  let placeBet = document.querySelector("#place-bet");
  let playerDisplay = document.querySelector(".player-cards");
  let playerCardsContainer = document.querySelector(".player-cards-container");
  let compContainer = document.querySelector(".comp-container");
  let pScore = document.querySelector(".pScore");
  let cScore = document.querySelector(".cScore");
  let gamestageMsg = document.querySelector(".gamestage-message");
  let compGamestageMsg = document.querySelector(".comp-gamestage-message");
  let playerBtns = document.querySelectorAll(".pbtns");
  let betDisplay = document.querySelector(".bet-display");
  let subtractBetButton = document.querySelector(".minus-bet");
  let addBetButton = document.querySelector(".plus-bet");
  let betButtons = document.querySelectorAll(".bet-btns");
  let test = document.querySelector("#testy");

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
    changeButtonFunction("off", "player");
  };

  placeBet.addEventListener("click", pressPlaceBetButton);
  stand.addEventListener("click", pressStandButton);
  hit.addEventListener("click", pressHitButton);
  doubleDown.addEventListener("click", pressDoubleDownButton);
  addBetButton.addEventListener("click", addBet);
  subtractBetButton.addEventListener("click", subtractBet);

  function changeButtonFunction(state, group) {
    if (state === "on" && group === "player") {
      hit.disabled = false;
      stand.disabled = false;
      doubleDown.disabled = false;
      split.disabled = false;
    } else if (state === "off" && group === "player") {
      hit.disabled = true;
      stand.disabled = true;
      doubleDown.disabled = true;
      split.disabled = true;
    } else if (state === "on" && group === "bet") {
      addBetButton.disabled = false;
      subtractBetButton.disabled = false;
      placeBet.disabled = false;
    } else if (state === "off" && group === "bet") {
      addBetButton.disabled = true;
      subtractBetButton.disabled = true;
      placeBet.disabled = true;
    } else if (state === "on" && group === "all") {
      hit.disabled = false;
      stand.disabled = false;
      doubleDown.disabled = false;
      split.disabled = false;
      addBetButton.disabled = false;
      subtractBetButton.disabled = false;
      placeBet.disabled = false;
    } else if (state === "off" && group === "all") {
      hit.disabled = true;
      stand.disabled = true;
      doubleDown.disabled = true;
      split.disabled = true;
      addBetButton.disabled = true;
      subtractBetButton.disabled = true;
      placeBet.disabled = true;
    }
  }

  test.onclick = () => {
    console.log(gameData.compGameState, "CGS");
    console.log(gameData.playerGameState, "PGS");
    console.log(gameData.roundEnded, "ended");
    newRoundTimer();
    flipCard()
  }

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
      startGameFlipCard()

      if (gameData.playerScore === 21) {
        setGameState("player");
        setGameState("comp");
        gameData.roundEnded = true;
        changeButtonFunction("off", "all")
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

      if (gameData.playerScore > 21) {
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        // newRoundTimer();
      }

      gameData.playerGameState = getWinnerData(gameData.compGameState, gameData.playerGameState);
      gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);

      if (gameData.playerGameState !== '' && gameData.compGameState !== '') {
        gameData.roundEnded = true;
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function pressStandButton() {

    changeButtonFunction("off", "all")
    await handleSecondCard();

    while (gameData.compScore <= 16 && gameData.compScore <= gameData.playerScore) {

      await delay(500);
      await printCompCards();
      setGameState("player");
      setGameState("comp");

      if (gameData.compScore >= 17) {
        gameData.finalDraw = true;
        setGameState("player");
        setGameState("comp");
        break;
      }
    }

    if (gameData.playerGameState !== '' && gameData.compGameState !== '') {
      gameData.roundEnded = true;
    }

    gameData.playerGameState = getWinnerData(gameData.compGameState, gameData.playerGameState);
    gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);
    gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
    gameData.playerCredits += +gameData.currentBet;
    displayCredits();
    // newRoundTimer();

  }

  async function pressDoubleDownButton() {
    await printPlayerCards();

    gameData.playerGameState = getWinnerData(gameData.compGameState, gameData.playerGameState);
    gameData.compGameState = getWinnerData(gameData.playerGameState, gameData.compGameState);

    gameData.currentBet *= 2;
    gameData.playerCredits -= gameData.currentBet / 2;
    displayCredits();
    pressStandButton();
  }

  async function pressPlaceBetButton() {
    if (gameData.currentBet === 0) {
      alert("Place a bet first!");
    } else {
      changeButtonFunction("off", "bet");

      await startGame();
      await delay(100);

      changeButtonFunction("on", "player");
      gameData.playerCredits -= gameData.currentBet;
      betDisplay.innerHTML = 0;
      displayCredits();
    }
  }

  function addBet() {
    gameData.currentBet += gameData.minimumBet
    betDisplay.innerHTML = gameData.currentBet;
    displayCurrentBet();
  }

  function subtractBet() {
    gameData.currentBet -= gameData.minimumBet;
    betDisplay.innerHTML = gameData.currentBet;
    displayCurrentBet();
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
      cardElem.classList.add("card-holder");
      cardElem.style.opacity = 0;
      cardElem.innerHTML =
        `
        <div class="card-face card-face-flipped">
          <div class="card-front">
            <img src="${card.image}" alt="">
          </div>
          <div class="card-back">
            <img src="${card.backImage}" alt="">
          </div>
        </div>
        `;

      cardElem.style.left = gameData.playerCardDist + "px";
      gameData.playerCardDist += 17;

      playerCardsContainer.appendChild(cardElem);
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

      gameData.compHand.push(card);

      if (gameData.compHand.length < 2 || gameData.compHand.length > 2) {

        let cardElem = document.createElement("div");
        cardElem.classList.add("card-holder");
        cardElem.style.opacity = 0;
        cardElem.innerHTML =
          `
          <div class="card-face card-face-flipped">
            <div class="card-front">
              <img src="${card.image}" alt="">
            </div>
            <div class="card-back">
              <img src="${card.backImage}" alt="">
            </div>
          </div>
          
        `;

        cardElem.style.left = gameData.compCardDist + "px";
        gameData.compCardDist += 17;


        compContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem);

      } else if (gameData.compHand.length === 2) {

        let cardElem = document.createElement("div");
        cardElem.classList.add("card-holder");
        cardElem.style.opacity = 0;
        cardElem.innerHTML =
          `
          <div class="card-face card-face-flipped">
            <div class="card-front">
              <img src="${card.image}" alt="">
            </div>
            <div class="card-back">
              <img src="${card.backImage}" alt="">
            </div>
          </div>
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

    betDisplay.innerHTML = gameData.currentBet;
    innerDiv.innerHTML = `Total Credits: ${gameData.playerCredits}`;

    displayCurrentBet();
  }

  function displayCurrentBet() {
    let currentBetDisplay = document.querySelector(".current-bet");
    let innerDiv = currentBetDisplay.firstElementChild;

    if (gameData.roundEnded) {
      innerDiv.innerHTML = `You Won:    ${gameData.currentBet}`
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

  async function startGameFlipCard() {
    compFirstCard = compContainer.querySelector(".card-holder:nth-child(1)");
    playerFirstCard = playerCardsContainer.querySelector(".card-holder:nth-child(1)");
    playerSecondCard = playerCardsContainer.querySelector(".card-holder:nth-child(2)");

    compFirstCard.querySelector(".card-face").classList.toggle("card-face-flipped");
    await delay(500);
    playerFirstCard.querySelector(".card-face").classList.toggle("card-face-flipped");
    await delay(500);
    playerSecondCard.querySelector(".card-face").classList.toggle("card-face-flipped");

  }

  async function handleSecondCard() {
    let compSecondCard = compContainer.querySelector(".card-holder:nth-child(2)");

    compSecondCard.querySelector(".card-face").classList.toggle("card-face-flipped");

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

    playerCardsContainer.innerHTML = "";
    compContainer.innerHTML = "";
    betDisplay.innerHTML = gameData.currentBet;
    cScore.innerHTML = gameData.compScore;
    pScore.innerHTML = gameData.playerScore;
  }

  function newRoundTimer() {
    if (gameData.roundEnded) {


      let roundTimerDisplay = document.querySelector(".round-timer");
      let innerDiv = roundTimerDisplay.firstElementChild;
      let count = 5;

      roundTimerDisplay.style.display = "flex";

      innerDiv.innerHTML = `New round in ${count}`;

      let countdownInterval = setInterval(() => {
        count--;
        innerDiv.innerHTML = `New round in ${count}`;
        if (count === 0) {
          clearInterval(countdownInterval);
          roundTimerDisplay.style.display = "none";
          resetGameData();
          displayCurrentBet();
          changeButtonFunction("on", "bet");
        }
      }, 1000);
    }
  }
}
init()
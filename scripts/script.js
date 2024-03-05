const GAME_STATE_TYPES = {
  WIN: "WIN",
  DRAW: "DRAW",
  BUST: "BUST"
}

function init() {
  let hit = document.querySelector("#hit");
  let stand = document.querySelector("#stand");
  let split = document.querySelector("#split");
  let doubleDown = document.querySelector("#DD");
  let placeBet = document.querySelector("#place-bet");
  let playerCardsContainer = document.querySelector(".player-cards-container");
  let compContainer = document.querySelector(".comp-container");
  let pScore = document.querySelector(".pScore");
  let cScore = document.querySelector(".cScore");
  let screenMessage = document.querySelector("#screen");
  let betDisplay = document.querySelector(".bet-display");
  let subtractBetButton = document.querySelector(".minus-bet");
  let addBetButton = document.querySelector(".plus-bet");
  let playerScoreBubble = document.querySelector(".player-score-bubble");
  let currentBetBubble = document.querySelector(".current-bet-bubble");
  let gameMessageBubble = document.querySelector(".game-message-bubble");
  let playerCreditsBubble = document.querySelector(".player-credits-bubble");

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
    displayStartingMessage();
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

      await startGameFlipCard()


      if (gameData.playerScore === 21) {
        changeButtonFunction("off", "player")
        setGameState("player");
        setGameState("comp");
        gameData.roundEnded = true;

        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
        gameData.playerCredits += gameData.currentBet;
        displayCredits();

        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        screenMessageAnimation(gameMessageBubble, 20);
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function pressHitButton() {
    try {
      changeButtonFunction("off", "player");
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
        setGameState("player");
        setGameState("comp");

        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        screenMessageAnimation(gameMessageBubble);
        // newRoundTimer();
      } else if (gameData.playerScore === 21) {
        setGameState("player")
        setGameState("comp")
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        screenMessageAnimation(gameMessageBubble);
      } else {
        changeButtonFunction("on", "player");
      }

      setGameState("player");
      setGameState("comp");

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

      if (gameData.compScore >= 17 && gameData.compScore > gameData.playerScore && gameData.compScore < 21) {
        gameData.finalDraw = true;
        setGameState("player");
        setGameState("comp");
        console.log(gameData.playerGameState, gameData.compGameState, "stand")

        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        break;
      }
    }

    if (gameData.playerGameState !== '' && gameData.compGameState !== '') {
      gameData.roundEnded = true;
    }

    setGameState("player");
    setGameState("comp");
    console.log(gameData.playerGameState, gameData.compGameState, "out")

    gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
    gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
    gameData.playerCredits += +gameData.currentBet;
    displayCredits();
    // newRoundTimer();

  }

  async function pressDoubleDownButton() {
    await printPlayerCards();



    setGameState("player");
    setGameState("comp");

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
      displayCredits();
    }
  }

  function addBet() {
    if (gameData.currentBet > gameData.playerCredits) {
      gameData.currentBet = gameData.playerCredits;
      currentBetBubble.innerHTML = `You do not have enough credits`;
      screenMessageAnimation(currentBetBubble, 20);
    } else {
      gameData.currentBet += gameData.minimumBet;
      currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`;
      screenMessageAnimation(currentBetBubble, 20);
      displayCurrentBet();
    }
  }

  function subtractBet() {
    if (gameData.currentBet < gameData.minimumBet) {
      currentBetBubble.innerHTML = `Bet: ${gameData.minimumBet}`;
      gameData.currentBet = gameData.minimumBet;
      displayCurrentBet();
    }
    gameData.currentBet -= gameData.minimumBet;
    currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`;
    screenMessageAnimation(currentBetBubble, 20);
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
      gameData.playerCardDist += 105;

      playerCardsContainer.appendChild(cardElem);
      await delay(100);
      fadeIn(cardElem);

      if (gameData.playerHand.length > 2) {
        await delay(500);
        flipLastCard("player");
      }
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
        gameData.compCardDist += 105;


        compContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem);

        if (gameData.compHand.length > 2) {
          await delay(500);
          flipLastCard("comp");
        }

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
        gameData.compCardDist += 105;

        compContainer.appendChild(cardElem);
        await delay(500);
        fadeIn(cardElem);
      }
      setGameState("comp")
    }
    countUserScore("comp");
  }

  function displayStartingMessage() {
    playerScoreBubble.innerHTML = `Your Score: ${gameData.playerScore}`
    gameMessageBubble.innerHTML = "Place Your Bet";
  }

  function countUserScore(user) {
    if (user === "player") {
      let pCount = 0;
      gameData.playerScoreArray.forEach((item) => {


        pCount += +item
        gameData.playerScore = +pCount
        playerScoreBubble.innerHTML = `Your Score: ${gameData.playerScore}`;

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
    let innerDiv = playerCreditsBubble.firstElementChild;

    currentBetBubble.innerHTML = gameData.currentBet;
    innerDiv.innerHTML = `Total Credits: ${gameData.playerCredits}`;

    displayCurrentBet();
  }

  function displayCurrentBet() {
    currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`;

    if (gameData.roundEnded) {
      currentBetBubble.innerHTML = `You Won: ${gameData.currentBet}`
    } else {
      if (gameData.currentBet > 0) {
        currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`
      } else {
        currentBetBubble.innerHTML = `Bet: ${0}`
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

  async function flipLastCard(user) {
    if (user === "player") {
      let latestPlayerCard = playerCardsContainer.lastElementChild
      latestPlayerCard.querySelector(".card-face").classList.toggle("card-face-flipped");
    } else {
      let latestCompCard = compContainer.lastElementChild
      latestCompCard.querySelector(".card-face").classList.toggle("card-face-flipped");
    }
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
      if (userScore < opponentScore && opponentScore < 21) {
        return "BUST";
      } else if (userScore === 21) {
        return "WIN";
      } else if (userScore > opponentScore && userScore < 21) {
        return "WIN";
      } else if (userScore === opponentScore) {
        return "DRAW";
      } else if (userScore > 21) {
        return "BUST";
      }
    } else {
      if (userScore > 21) {
        return "BUST"
      } else if (userScore === 21) {
        return "WIN"
      }
    }
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
    currentBetBubble.innerHTML = gameData.currentBet;
    cScore.innerHTML = gameData.compScore;

    playerScoreBubble.innerHTML = `Your Score: ${gameData.playerScore}`;
  }

  function newRoundTimer() {
    if (gameData.roundEnded) {
      let count = 5;

      gameMessageBubble.innerHTML = `New round in ${count}`;
      screenMessageAnimation(gameMessageBubble, 20);

      let countdownInterval = setInterval(() => {
        count--;
        gameMessageBubble.innerHTML = `New round in ${count}`;
        screenMessageAnimation(gameMessageBubble, 20);

        if (count === 0) {
          clearInterval(countdownInterval);
          gameMessageBubble.innerHTML = "Place Your Bet";
          screenMessageAnimation(gameMessageBubble, 20);
          resetGameData();
          displayCurrentBet();
          changeButtonFunction("on", "bet");
        }
      }, 1000);
    }
  }

  function screenMessageAnimation(element, ms) {
    let completeCount;
    let newText;

    const array = element.textContent.split('')
    const special = ['~', '@', '!', '#', '$', '%', '^', '&', '*']
    const exception = [' ', '\n', '.', ',']
    const random = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const numArray = []
    array.forEach(char => {
      const num = random(5, 40)
      numArray.push(num)
    })

    const timer = setInterval(() => {
      completeCount = 0
      newText = ''
      numArray.forEach((num, i) => {
        if (exception.includes(array[i]) || numArray[i] === 0) {
          newText += array[i]
          completeCount += 1
        } else {
          newText += special[numArray[i] % special.length]
          numArray[i] = --num
        }
      })

      element.innerText = newText
      if (completeCount === numArray.length) clearInterval(timer)
    }, ms)
  }

  function printGameState(opponentState, userState) {
    if (userState === GAME_STATE_TYPES.WIN) {
      return `YOU WON ${gameData.currentBet} credits`;
    } else if (opponentState === GAME_STATE_TYPES.DRAW) {
      return `DRAW: Returned ${gameData.currentBet} credits`;
    } else if (opponentState === GAME_STATE_TYPES.BUST)
      return `YOU LOST ${gameData.currentBet} credits`;
  }



}

init()
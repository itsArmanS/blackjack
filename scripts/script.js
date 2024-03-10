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
  let subtractBetButton = document.querySelector(".minus-bet");
  let addBetButton = document.querySelector(".plus-bet");
  let playerScoreBubble = document.querySelector(".player-score-bubble");
  let currentBetBubble = document.querySelector(".current-bet-bubble");
  let gameMessageBubble = document.querySelector(".game-message-bubble");
  let playerCreditsBubble = document.querySelector(".player-credits-bubble");
  let compScoreBubble = document.querySelector(".comp-score-bubble");

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
    minimumBet: 500,
    previousBet: 0,

    deckSplit: false,
    splitSwitch: false,
    splitScore1: 0,
    splitScore2: 0,
    splitCardArray: [[], []],
    splitScoreArray: [[], []],
    splitState1: "",
    splitState2: "",
    splitCardDist1: 0,
    splitCardDist2: 0,
  }

  window.onload = () => {
    getDeckData();
    displayCredits();
    changeButtonFunction("off", "player");
    // changeButtonFunction("off", "split");
    displayStartingMessage();
  };

  placeBet.addEventListener("click", pressPlaceBetButton);
  stand.addEventListener("click", pressStandButton);
  hit.addEventListener("click", pressHitButton);
  doubleDown.addEventListener("click", pressDoubleDownButton);
  split.addEventListener("click", pressSplitButton);
  addBetButton.addEventListener("click", addBet);
  subtractBetButton.addEventListener("click", subtractBet);

  function changeButtonFunction(state, group) {
    if (state === "on" && group === "player") {
      hit.disabled = false;
      stand.disabled = false;
      doubleDown.disabled = false;
    } else if (state === "off" && group === "player") {
      hit.disabled = true;
      stand.disabled = true;
      doubleDown.disabled = true;
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
      addBetButton.disabled = false;
      subtractBetButton.disabled = false;
      placeBet.disabled = false;
    } else if (state === "off" && group === "all") {
      hit.disabled = true;
      stand.disabled = true;
      doubleDown.disabled = true;
      addBetButton.disabled = true;
      subtractBetButton.disabled = true;
      placeBet.disabled = true;
    } else if (state === "on" && group === "split") {
      split.disabled = false;
    } else if (state === "off" && group === "split") {
      split.disabled = true;
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
      displayScores("player");
      displayScores("comp");
      await printCompCards();
      await printPlayerCards();
      await printCompCards();
      await printPlayerCards();

      await startGameFlipCard()


      if (gameData.playerScore === 21) {
        setGameState("player");
        setGameState("comp");
        gameData.roundEnded = true;

        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
        gameData.playerCredits += gameData.currentBet;
        displayCredits();

        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        screenMessageAnimation(gameMessageBubble, 20);
      }

      if (gameData.playerHand[0].value === gameData.playerHand[1].value) {
        changeButtonFunction("on", "split")
      }

    } catch (error) {
      console.log(error);
    }
  }

  async function pressPlaceBetButton() {
    if (gameData.currentBet === 0) {
      alert("Place a bet first!");
    } else {
      changeButtonFunction("off", "bet");

      gameData.playerCardDist = (playerCardsContainer.clientWidth / 2) - 165;
      gameData.compCardDist = (playerCardsContainer.clientWidth / 2) - 165;

      gameData.previousBet = gameData.currentBet;
      await startGame();
      await delay(100);

      changeButtonFunction("on", "player");
      gameData.playerCredits -= gameData.currentBet;
      displayCredits();
    }
  }

  async function pressHitButton() {
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
      gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
      gameData.playerCredits += gameData.currentBet;
      gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
      screenMessageAnimation(gameMessageBubble);
    } else {
      changeButtonFunction("on", "player");
    }

    setGameState("player");
    setGameState("comp");

    if (gameData.playerGameState !== '' || gameData.compGameState !== '') {
      gameData.roundEnded = true;
    }
  }

  async function pressSplitHitButton(deckNumber) {
    let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
    let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");


    // fadeIn(innerScoreWrapper1, 50);
    // fadeIn(innerScoreWrapper2, 50);

    if (gameData.deckSplit || deckNumber === 1) {
      console.log("test")
      console.log(gameData.splitSwitch)

      if (gameData.splitSwitch === false) {
        // changeButtonFunction("off", "player");
        await printSplitCards(1);
        countUserScore("player", gameData.deckSplit, 1);

        if (gameData.splitScore1 > 21) {

          changeButtonFunction("off", "all");
          setGameState("player", 1, gameData.deckSplit);
          setGameState("comp");
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState1);
          screenMessageAnimation(gameMessageBubble);
          await delay(500);
          pressSplitStandButton();
          changeButtonFunction("on", "player");

          innerScoreWrapper1.classList.remove("active");
          innerScoreWrapper2.classList.add("active");

        } else if (gameData.splitScore1 === 21) {
          changeButtonFunction("off", "all");
          gameData.splitSwitch = true;
          setGameState("player", 1, gameData.deckSplit);
          setGameState("comp");

          innerScoreWrapper1.classList.remove("active");
          innerScoreWrapper2.classList.add("active");

          gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
          gameData.playerCredits += gameData.currentBet;
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState1);
          screenMessageAnimation(gameMessageBubble);

          await delay(1000);
          changeButtonFunction("on", "player");

        } else {
          changeButtonFunction("on", "player");
        }
      } else {

        await printSplitCards(2);
        countUserScore("player", gameData.deckSplit, 2);

        if (gameData.splitScore2 > 21) {
          changeButtonFunction("off", "all");
          setGameState("player", 2, gameData.deckSplit);
          setGameState("comp");

          console.log(gameData.splitState2, gameData.compGameState, "Splitstates")
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState2);
          screenMessageAnimation(gameMessageBubble);

          innerScoreWrapper2.classList.remove("active");
        } else if (gameData.splitScore2 === 21) {
          setGameState("player", 2, gameData.deckSplit);
          setGameState("comp");

          gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
          gameData.playerCredits += gameData.currentBet;
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState2);
          screenMessageAnimation(gameMessageBubble);

          innerScoreWrapper2.classList.remove("active");
        } else {
          changeButtonFunction("on", "player");
        }

      }
    }
    if (gameData.splitState1 !== '' || gameData.splitState2 !== '') {
      gameData.roundEnded = true;
    }
  }

  async function pressStandButton() {
    await handleSecondCard()

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

  async function pressSplitStandButton() {
    let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
    let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");

    innerScoreWrapper1.classList.remove("active");
    innerScoreWrapper2.classList.add("active");

    if (gameData.splitSwitch === true) {
      changeButtonFunction("off", "all");
      await handleSecondCard();

      innerScoreWrapper2.classList.remove("active");

      while (gameData.compScore <= 16) {
        // && gameData.compScore <= gameData.splitScore1
        await delay(500);
        await printCompCards();
        setGameState("player", 1, gameData.deckSplit);
        setGameState("player", 2, gameData.deckSplit);
        setGameState("comp");
        console.log(gameData.splitState1, gameData.compGameState, "stand in split deck1 under 16")
        console.log(gameData.splitState2, gameData.compGameState, "stand in split deck2 under 16")

        if (gameData.compScore >= 17 && (gameData.compScore > gameData.splitScore1 && gameData.compScore > gameData.splitScore2) && gameData.compScore < 21) {
          gameData.finalDraw = true;
          setGameState("player", 1, gameData.deckSplit);
          setGameState("player", 2, gameData.deckSplit);
          setGameState("comp");
          console.log(gameData.splitState1, gameData.compGameState, "stand in split deck1 over 17")
          console.log(gameData.splitState2, gameData.compGameState, "stand in split deck2 over 17")

          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState1);
          await delay(1000);
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState2);
          break;
        }
      }
    }
    setGameState("player", 1, gameData.deckSplit);
    setGameState("player", 2, gameData.deckSplit);
    setGameState("comp");

    console.log(gameData.splitState1, gameData.compGameState, "stand in split deck1 out")
    console.log(gameData.splitState2, gameData.compGameState, "stand in split deck2 out2")
    gameData.splitSwitch = true;
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

  async function pressSplitButton() {
    console.log(gameData.splitCardArray, "splitcardarrry OUT")
    hit.removeEventListener("click", pressHitButton);
    hit.addEventListener("click", pressSplitHitButton);
    stand.removeEventListener("click", pressStandButton);
    stand.addEventListener("click", pressSplitStandButton);
    gameData.deckSplit = true

    await hideUserScore("player");
    await printSplitContainer();
    await displaySplitScores();
    await printFirstSplitCards();
    await printSplitCards(1);
    await printSplitCards(2);

    await delay(150);
    // changeButtonFunction("off", "split")



    if (gameData.playerHand[0].value === gameData.playerHand[1].value) {




    }
  }

  async function printSplitContainer() {  
    await fadeOut(playerCardsContainer.children[0], 65);
    await fadeOut(playerCardsContainer.children[1], 65);

    let playerScoreSplitBubble = document.querySelector(".player-score-bubble-wrapper");
    playerScoreSplitBubble.classList.add("split");
    fadeIn(playerScoreSplitBubble, 50);

    playerScoreSplitBubble.innerHTML = 
    `
    <div class="split-cards-score1">
      <div class="inner-score-wrapper1">
        <div class="split-inner-score1"></div>
      </div>
    </div>
    <div class="split-cards-score2">
      <div class="inner-score-wrapper2">
        <div class="split-inner-score2"></div>
      </div>
    </div>
    `

    playerCardsContainer.innerHTML =
      `
      <div class="split-container-wrapper">
      <div class="container1-wrapper">
        <div class="split-cards-container1">

        </div>
      </div>
      <div class="container2-wrapper">
        <div class="split-cards-container2">

        </div>
      </div>
    </div>
    `

    let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
    let splitContainer1 = document.querySelector(".split-cards-container1");
    let splitContainer2 = document.querySelector(".split-cards-container2");

    gameData.splitCardDist1 = (splitContainer1.clientWidth / 2) - 105;
    gameData.splitCardDist2 = (splitContainer2.clientWidth / 2) - 105;



    innerScoreWrapper1.classList.add("active");
  }

  async function printFirstSplitCards() {
    let splitContainer1 = document.querySelector(".split-cards-container1");
    let splitContainer2 = document.querySelector(".split-cards-container2");
    let innerScoreDiv1 = document.querySelector(".split-inner-score1");
    let innerScoreDiv2 = document.querySelector(".split-inner-score2");

    gameData.splitCardArray[0].push(gameData.playerHand[0]);
    gameData.splitCardArray[1].push(gameData.playerHand[1]);

    for (let card of gameData.splitCardArray[0]) {

      gameData.splitScoreArray[0].push(+card.bjVal);

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

      cardElem.style.left = gameData.splitCardDist1 + "px";
      gameData.splitCardDist1 += 15;
      cardElem.style.top = "40%";

      splitContainer1.appendChild(cardElem);
      await delay(100);
      fadeIn(cardElem, 50);
      await delay(200);
      flipLastCard("player", gameData.deckSplit, 1);
    }

    for (let card of gameData.splitCardArray[1]) {

      gameData.splitScoreArray[1].push(+card.bjVal);


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

      cardElem.style.left = gameData.splitCardDist2 + "px";
      gameData.splitCardDist2 += 15;
      cardElem.style.top = "40%";

      splitContainer2.appendChild(cardElem);
      await delay(100);
      fadeIn(cardElem, 50);
      await delay(200);
      flipLastCard("player", gameData.deckSplit, 2);
    }
    countUserScore("player", gameData.deckSplit, 1);
    countUserScore("player", gameData.deckSplit, 2);
    fadeIn(innerScoreDiv1, 100);
    fadeIn(innerScoreDiv2, 100);
    console.log(gameData.splitCardArray, "plitcards")
  }

  async function printSplitCards(deckNumber) {
    let splitContainer1 = document.querySelector(".split-cards-container1");
    let splitContainer2 = document.querySelector(".split-cards-container2");
    let innerScoreDiv1 = document.querySelector(".split-inner-score1");
    let innerScoreDiv2 = document.querySelector(".split-inner-score2");

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameData.deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let splitPlayerCards = drawData.cards;

    for (let card of splitPlayerCards) {
      card.backImage = "https://deckofcardsapi.com/static/img/back.png";

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

      fadeIn(cardElem, 50);
      cardElem.style.top = "40%";

      if (deckNumber === 1) {
        cardElem.style.left = gameData.splitCardDist1 + "px";
        gameData.splitCardDist1 += 15;
        splitContainer1.appendChild(cardElem);
        await delay(500);

        card.bjVal = +getValueByCardType(card.value, "player", 1);
        gameData.splitCardArray[0].push(card);
        gameData.splitScoreArray[0].push(+card.bjVal);
        await delay(100);
        countUserScore("player", gameData.deckSplit, 1);
        fadeIn(innerScoreDiv1, 50);
        await flipLastCard("player", gameData.deckSplit, 1);


      } else {
        cardElem.style.left = gameData.splitCardDist2 + "px";
        gameData.splitCardDist2 += 15;
        splitContainer2.appendChild(cardElem);
        await delay(500);

        card.bjVal = +getValueByCardType(card.value, "player", 2);
        gameData.splitCardArray[1].push(card);
        gameData.splitScoreArray[1].push(+card.bjVal);
        await delay(100);
        countUserScore("player", gameData.deckSplit, 2);
        fadeIn(innerScoreDiv2, 50);
        flipLastCard("player", gameData.deckSplit, 2);
      }
      console.log(gameData.splitScore1, gameData.splitScore2, "Split Scores")
    }


  }

  function addBet() {
    if (gameData.currentBet === gameData.playerCredits) {
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
    if (gameData.currentBet < gameData.minimumBet || gameData.currentBet === 0) {
      currentBetBubble.innerHTML = `Bet: ${gameData.minimumBet}`;
      gameData.currentBet = gameData.minimumBet;
      displayCurrentBet();
    }
    gameData.currentBet -= gameData.minimumBet;
    currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`;
    screenMessageAnimation(currentBetBubble, 20);
    displayCurrentBet();
  }

  function getValueByCardType(cardType, user, deckNumber) {
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
          if (gameData.deckSplit === true) {
            if (deckNumber === 1) {
              return (gameData.splitScore1 + 11 > 21) ? 1 : 11;
            }else {
              return (gameData.splitScore2 + 11 > 21) ? 1 : 11;
            }
          } else {
            return (gameData.playerScore + 11 > 21) ? 1 : 11;
          }
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
      cardElem.classList.add("card-holder", "slide-in");
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

      cardElem.style.left = "100%";
      cardElem.style.top = "40%";


      playerCardsContainer.appendChild(cardElem);
      await delay(100);
      fadeIn(cardElem, 75);

      cardElem.style.transition = "left 1s ease-in-out";
      cardElem.style.left = gameData.playerCardDist + "px";
      gameData.playerCardDist += 105;

      if (gameData.playerHand.length > 2) {
        await delay(500);
        flipLastCard("player");
      }
    }
    setGameState("player");
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
        cardElem.classList.add("card-holder", "slide-in");
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

        cardElem.style.left = "100%";
        cardElem.style.top = "20%";


        compContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem, 75);

        cardElem.style.transition = "left 1s ease-in-out";
        cardElem.style.left = gameData.compCardDist + "px";
        gameData.compCardDist += 105;

        if (gameData.compHand.length > 2) {
          await delay(500);
          flipLastCard("comp");
        }

      } else if (gameData.compHand.length === 2) {

        let cardElem = document.createElement("div");
        cardElem.classList.add("card-holder", "slide-in");
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

        cardElem.style.left = "100%";
        cardElem.style.top = "20%";


        compContainer.appendChild(cardElem);
        await delay(500);
        fadeIn(cardElem, 75);

        cardElem.style.transition = "left 1s ease-in-out";
        cardElem.style.left = gameData.compCardDist + "px";
        gameData.compCardDist += 105;
      }
      setGameState("comp")
    }
    countUserScore("comp");
  }

  function displayStartingMessage() {
    fadeIn(playerScoreBubble, 50);
    gameMessageBubble.innerHTML = "Place Your Bet";
  }

  function countUserScore(user, deckSplit, deckNumber) {
    let innerScoreDiv1 = document.querySelector(".split-inner-score1");
    let innerScoreDiv2 = document.querySelector(".split-inner-score2");

    if (user === "player") {
      if (deckSplit) {
        if (deckNumber === 1) {
          let split1Count = 0;
          for (let item of gameData.splitScoreArray[0]) {
            split1Count += +item;
            gameData.splitScore1 = +split1Count;
            innerScoreDiv1.innerHTML = gameData.splitScore1;
          }
        } else {
          let split2Count = 0;
          for (let item of gameData.splitScoreArray[1]) {
            split2Count += +item;
            gameData.splitScore2 = +split2Count;
            innerScoreDiv2.innerHTML = gameData.splitScore2;
          }
        }
      } else {
        let pCount = 0;
        gameData.playerScoreArray.forEach((item) => {
          pCount += +item;
          gameData.playerScore = +pCount;
          playerScoreBubble.innerHTML = gameData.playerScore;;
          fadeIn(playerScoreBubble, 50);
        })
      }
    } else {
      let cCount = 0;
      gameData.compScoreArray.forEach((item) => {
        if (gameData.standClicked) {
          cCount += +item;
          gameData.compScore = +cCount;
          compScoreBubble.innerHTML = gameData.compScore;
          fadeIn(compScoreBubble, 50);
        } else {
          compScoreBubble.innerHTML = gameData.compScoreArray[0];
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

  async function hideUserScore(user) {
    if(user === "player") {
      let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");

      await fadeOut(playerScoreBubbleWrapper, 50);
      await fadeOut(playerScoreBubble, 50);
      playerScoreBubbleWrapper.classList.remove("active");
    }else {
      let compScoreBubbleWrapper = document.querySelector(".comp-score-bubble-wrapper");

      await fadeOut(compScoreBubbleWrapper, 50);
      await fadeOut(compScoreBubble, 50);
      compScoreBubbleWrapper.classList.remove("active");
    }
  }

  async function displayScores(user) {
    if(user === "player") {
      let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");

      playerScoreBubbleWrapper.classList.add("active");
      await fadeIn(playerScoreBubbleWrapper, 50);
    }else {
      let compScoreBubbleWrapper = document.querySelector(".comp-score-bubble-wrapper");

      compScoreBubbleWrapper.classList.add("active");
      await fadeIn(compScoreBubbleWrapper, 50);
    }
  }

  async function displaySplitScores() {
    let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
    let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");

    fadeIn(innerScoreWrapper1);
    fadeIn(innerScoreWrapper2);
  }

  function displayCurrentBet() {
    currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`;

    if (gameData.roundEnded) {
      currentBetBubble.innerHTML = `Bet: ${gameData.previousBet}`;
    } else {
      if (gameData.currentBet > 0) {
        currentBetBubble.innerHTML = `Bet: ${gameData.currentBet}`
      } else {
        currentBetBubble.innerHTML = `Bet: ${0}`
      }
    }
  }

  async function fadeIn(element, ms) {
    element.style.opacity = 0;
    let opacity = 0;
    let timer = setInterval(function () {
      if (opacity >= 1) {
        clearInterval(timer);
      }
      element.style.opacity = opacity;
      opacity += 0.1;
    }, ms);
  }

  async function fadeOut(element, ms) {
    element.style.opacity = 1;
    let opacity = 1;
    let timer = setInterval(function () {
      if (opacity <= 0) {
        clearInterval(timer);
      }
      element.style.opacity = opacity;
      opacity -= 0.1;
    }, ms);
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

  async function flipLastCard(user, splitStatus, splitDeckNumber) {
    let splitContainer1 = document.querySelector(".split-cards-container1");
    let splitContainer2 = document.querySelector(".split-cards-container2");

    if (splitStatus) {
      if (splitDeckNumber === 1) {
        let latestSplitCard = splitContainer1.lastElementChild;
        latestSplitCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      } else {
        let latestSplitCard = splitContainer2.lastElementChild;
        latestSplitCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      }
    } else {
      if (user === "player") {
        let latestPlayerCard = playerCardsContainer.lastElementChild;
        latestPlayerCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      } else {
        let latestCompCard = compContainer.lastElementChild
        latestCompCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      }
    }
  }

  async function handleSecondCard() {
    let compSecondCard = compContainer.querySelector(".card-holder:nth-child(2)");

    compSecondCard.querySelector(".card-face").classList.toggle("card-face-flipped");

    gameData.standClicked = true;
    countUserScore("comp");
  }

  function setGameState(user, deckNumber, deckSplit) {
    if (user === "player") {
      if (deckSplit) {
        if (deckNumber === 1) {
          gameData.splitState1 = stateLogicSetter(gameData.splitScore1, gameData.compScore, gameData.standClicked)
        } else {
          gameData.splitState2 = stateLogicSetter(gameData.splitScore2, gameData.compScore, gameData.standClicked)
        }
      } else {
        gameData.playerGameState = stateLogicSetter(gameData.playerScore, gameData.compScore, gameData.standClicked);
      }
    } else {
      gameData.compGameState = stateLogicSetter(gameData.compScore, gameData.playerScore, gameData.standClicked);
    }
  }

  function stateLogicSetter(userScore, opponentScore, clicked) {
    if (clicked) {
      if (userScore < opponentScore && opponentScore <= 21) {
        return "BUST";
      } else if (userScore === 21) {
        return "WIN";
      } else if (userScore > opponentScore && userScore < 21) {
        return "WIN";
      } else if (userScore === opponentScore) {
        return "DRAW";
      } else if (userScore > 21) {
        return "BUST";
      } else if (userScore < opponentScore && opponentScore > 21) {
        return "WIN";
      }
    } else {
      if (userScore > 21) {
        return "BUST"
      } else if (userScore === 21) {
        return "WIN"
      }
    }
  }

  function decideBetReturn(userState) {
    if (userState === GAME_STATE_TYPES.WIN) {
      return 2.5;
    } else if (userState === GAME_STATE_TYPES.DRAW) {
      return 1;
    } else if (userState === GAME_STATE_TYPES.BUST) {
      return 0;
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
  }

  function newRoundTimer() {
    if (gameData.roundEnded) {
      let count = 2;

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
          changeButtonFunction("off", "player");
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
      return `YOU WON ${gameData.currentBet} CREDITS`;
    } else if (opponentState === GAME_STATE_TYPES.DRAW) {
      return `DRAW: Returned ${gameData.currentBet} CREDITS`;
    } else if (opponentState === GAME_STATE_TYPES.BUST) {
      return `YOU WON ${gameData.currentBet} CREDITS`;
    }
    return `YOU LOST ${gameData.currentBet} CREDITS`
  }

}

init()
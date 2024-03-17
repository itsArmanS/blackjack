async function init() {
  let USER_LOCAL_DATA;
  const USER_LOCAL_DATA_KEY = "userLocalData";
  let currentUser = '';

  const GAME_STATE_TYPES = {
    WIN: "WIN",
    DRAW: "DRAW",
    BUST: "BUST",
  }

  const SETTINGS_DATA = {
    sound: true,
    music: true,
  }

  let gameData = {
    playerCredits: 50000,
    playerScore: 0,
    playerHand: [],
    playerScoreArray: [],
    playerCardDist: 0,
    playerGameState: "",
    over17Bust: false,
    over17Draw: false,
    over17Win: false,

    compScore: 0,
    compHand: [],
    compScoreArray: [],
    compCardDist: 0,
    compGameState: "",

    deckID: "",
    standClicked: false,
    finalDraw: false,
    roundEnded: false,
    newRound: false,
    currentBet: 0,
    minimumBet: 500,
    previousBet: 0,

    deckSplit: false,
    splitSwitch: false,
    splitScore1: 0,
    splitScore2: 0,
    splitCardArray: [[], []],
    splitScoreArray: [[], []],
    splitCompState1: "",
    splitCompState2: "",
    splitState1: "",
    splitState2: "",
    splitCardDist1: 0,
    splitCardDist2: 0,
    splitBet1: 0,
    splitBet2: 0,
  }

  let userStats = {
    wins: 0,
    busts: 0,
    draws: 0,
    blackjacks: 0,
    over10kWins: 0,
    over100kCredits: false,
    over1mCredits: false,
  }

  async function getDeckData() {
    try {
      let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=10");
      let data = await response.json();

      gameData.deckID = data.deck_id;
      console.log(gameData.deckID)
    } catch (error) {
      console.log("Error shuffling:", error);
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

  async function fadeOut(element, ms, callback) {
    element.style.opacity = 1;
    let opacity = 1;
    let timer = setInterval(function () {
      if (opacity <= 0) {
        clearInterval(timer);
        if (callback) callback();
      }
      element.style.opacity = opacity;
      opacity -= 0.1;
    }, ms);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function loginScreen() {
    USER_LOCAL_DATA = JSON.parse(localStorage.getItem(USER_LOCAL_DATA_KEY)) || {};


    let logoutButton = document.getElementById("logout");
    let signinButton = document.getElementById("signin");
    let signupButton = document.getElementById("signup");
    let createAccount = document.getElementById("create-account");
    let backToSignin = document.getElementById("back-to-signin");

    signinButton.addEventListener("click", signin);
    signupButton.addEventListener("click", signup);
    createAccount.addEventListener("click", changeSignInUp);
    backToSignin.addEventListener("click", returnToSignin);

    logoutButton.addEventListener("click", logout);

    async function changeSignInUp() {
      let signinForm = document.getElementById("signin-form");
      let signupForm = document.getElementById("signup-form");

      await Promise.all([
        fadeOut(createAccount, 50),
        fadeOut(signinForm, 50),
        fadeIn(signupForm, 50)
      ]);

      signinForm.style.flex = 0;
      signupForm.style.flex = 1.5;
    }

    async function returnToSignin() {
      let signinForm = document.getElementById("signin-form");
      let signupForm = document.getElementById("signup-form");
      let usernameSignup = document.getElementById("usernameSignup");
      let passwordSignup = document.getElementById("passwordSignup");

      await Promise.all([
        fadeIn(createAccount, 50),
        fadeIn(signinForm, 50),
        fadeOut(signupForm, 50),
      ]);

      signinForm.style.flex = 1.5;
      signupForm.style.flex = 0;

      usernameSignup.value = "";
      passwordSignup.value = "";
    }

    async function logout() {
      let gameWrapper = document.querySelector(".game-wrapper");
      let signupWrapper = document.querySelector(".signup-wrapper");

      await Promise.all([
        fadeOut(gameWrapper, 50),
        fadeIn(signupWrapper, 50)
      ]);

      gameWrapper.style.flex = "0";
      signupWrapper.style.flex = "1";
      await delay(1000);
      location.reload();
    }

    async function signin() {
      let gameWrapper = document.querySelector(".game-wrapper");
      let signupWrapper = document.querySelector(".signup-wrapper");
      let usernameSignin = document.getElementById("usernameSignin");
      let passwordSignin = document.getElementById("passwordSignin");
      let username = usernameSignin.value;
      let password = passwordSignin.value;

      if (username !== '' && password !== '') {
        let userData = checkUserExistingData("in");
        if (userData) {
          if (USER_LOCAL_DATA.hasOwnProperty(username)) {
            let userData = USER_LOCAL_DATA[username];

            if (password === userData.password) {
              game();
              gameData = JSON.parse(userData.localGameData);
              userStats = JSON.parse(userData.localStats);

              await Promise.all([
                fadeIn(gameWrapper, 50),
                fadeOut(signupWrapper, 50)
              ]);
              gameWrapper.style.flex = "1";
              signupWrapper.style.flex = "0";

              currentUser = username;
              usernameSignin.value = "";
              passwordSignin.value = "";
            } else {
              showErrorBox("Incorrect Password", "signin");
              passwordSignin.value = "";
            }
          }
        } else {
          showErrorBox("No such user!", "signin");
        }
      } else {
        showErrorBox("Fields cannot be empty!", "signin");
      }
    }

    async function signup() {
      let usernameSignup = document.getElementById("usernameSignup");
      let passwordSignup = document.getElementById("passwordSignup");

      let newUsername = usernameSignup.value;
      let newPassword = passwordSignup.value;

      if (newUsername !== "" && newPassword !== "") {
        let userExists = checkUserExistingData("up");
        if (userExists === false) {
          showErrorBox("Username already taken!", "signup");
        } else {
          usernameSignup.value = "";
          passwordSignup.value = "";
          await delay(150);
          backToSignin.click();
        }
      } else {
        showErrorBox("Fields cannot be empty!", "signup");
      }
    }

    function checkUserExistingData(sign) {
      let passwordSignup = document.getElementById("passwordSignup");
      let newPassword = passwordSignup.value;

      if (sign === "in") {
        let username = document.getElementById("usernameSignin").value;

        if (USER_LOCAL_DATA.hasOwnProperty(username)) {
          return USER_LOCAL_DATA[username];
        } else {
          return null;
        }
      } else if (sign === "up") {
        let username = document.getElementById("usernameSignup").value;

        if (USER_LOCAL_DATA.hasOwnProperty(username)) {
          return false;
        } else {

          let newUserGameData = {
            playerCredits: 100000,
            playerScore: 0,
            playerHand: [],
            playerScoreArray: [],
            playerCardDist: 0,
            playerGameState: "",
            over17Bust: false,
            over17Draw: false,
            over17Win: false,

            compScore: 0,
            compHand: [],
            compScoreArray: [],
            compCardDist: 0,
            compGameState: "",

            deckID: "",
            standClicked: false,
            finalDraw: false,
            roundEnded: false,
            newRound: false,
            currentBet: 0,
            minimumBet: 500,
            previousBet: 0,

            deckSplit: false,
            splitSwitch: false,
            splitScore1: 0,
            splitScore2: 0,
            splitCardArray: [[], []],
            splitScoreArray: [[], []],
            splitCompState1: "",
            splitCompState2: "",
            splitState1: "",
            splitState2: "",
            splitCardDist1: 0,
            splitCardDist2: 0,
            splitBet1: 0,
            splitBet2: 0,
          }

          let newUserStats = {
            wins: 0,
            busts: 0,
            draws: 0,
            blackjacks: 0,
            over10kWins: 0,
            over100kCredits: false,
            over1mCredits: false,
          }

          USER_LOCAL_DATA[username] = {
            username: username,
            password: newPassword,
            localGameData: JSON.stringify(newUserGameData),
            localStats: JSON.stringify(newUserStats)
          };

          localStorage.setItem(USER_LOCAL_DATA_KEY, JSON.stringify(USER_LOCAL_DATA));

          return true;
        }
      }
    }

    async function showErrorBox(message, box) {
      if (box === "signin") {
        let signinErrorBox = document.querySelector(".signin-error-message-box");
        let timer = 2;

        signinErrorBox.innerHTML = `${message}`
        fadeIn(signinErrorBox, 50);

        async function hideErrorBox() {
          timer--;
          if (timer === 0) {
            clearInterval(countdownInterval);
            fadeOut(signinErrorBox, 50);
            await delay(500);
            signinErrorBox.innerHTML = "";
          }
        }
        let countdownInterval = setInterval(hideErrorBox, 2000);
      } else {
        let signupErrorBox = document.querySelector(".signup-error-message-box");
        let timer = 2;

        signupErrorBox.innerHTML = `${message}`
        fadeIn(signupErrorBox, 50);

        async function hideErrorBox() {
          timer--;
          if (timer === 0) {
            clearInterval(countdownInterval);
            fadeOut(signupErrorBox, 50);
            await delay(500);
            signupErrorBox.innerHTML = "";
          }
        }
        let countdownInterval = setInterval(hideErrorBox, 2000);
      }
    }
  }
  loginScreen();

  async function game() {
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
    let gameMessageBubble = document.querySelector(".game-message-bubble");
    let playerCreditsBubble = document.querySelector(".player-credits-bubble");
    let compScoreBubble = document.querySelector(".comp-score-bubble");

    let settingsModal = document.querySelector("#settings-dialog");
    let openSettingsModalButton = document.querySelector("#open-modal-button");
    let closeSettingsModalButton = document.querySelector("#close-modal-button");

    let rulesModal = document.getElementById("game-rules");
    let openRulesModalButton = document.getElementById("open-rules-button");
    let closeRulesModalButton = document.getElementById("close-rules-button");

    let statsModal = document.querySelector("#stats-menu");
    let openStatsModalButton = document.querySelector("#open-stats-button");
    let closeStatsModalButton = document.querySelector("#close-stats-button");

    let soundButton = document.getElementById("sound-button");
    let allButtons = document.querySelectorAll("button");
    const CLICK_SOUND = document.getElementById("click-sound");

    let test = document.getElementById("test");

    placeBet.addEventListener("click", pressPlaceBetButton);
    stand.addEventListener("click", pressStandButton);
    hit.addEventListener("click", pressHitButton);
    doubleDown.addEventListener("click", pressDoubleDownButton);
    split.addEventListener("click", pressSplitButton);
    addBetButton.addEventListener("click", addBet);
    subtractBetButton.addEventListener("click", subtractBet);
    openSettingsModalButton.addEventListener("click", openSettingsMenu);
    closeSettingsModalButton.addEventListener("click", closeSettingsMenu);
    openRulesModalButton.addEventListener("click", openRulesMenu);
    closeRulesModalButton.addEventListener("click", closeRulesMenu);
    openStatsModalButton.addEventListener("click", openStatsMenu);
    closeStatsModalButton.addEventListener("click", closeStatsMenu);

    test.addEventListener("click", testtest);
    function testtest() {
      console.log(gameData.roundEnded, 'roundEnded');
      console.log('roundEnded');

      newRoundTimer();
    }

    await getDeckData();
    displayCredits();
    displayCurrentBet(gameData.deckSplit);
    changeColorSettings();
    changeButtonFunction("off", "player");
    changeButtonFunction("off", "split");
    displayStartingMessage("on");
    gameData.playerCardDist = (playerCardsContainer.clientWidth / 2) - (105 / 2);
    gameData.compCardDist = (compContainer.clientWidth / 2) - (105 / 2);

    USER_LOCAL_DATA = JSON.parse(localStorage.getItem(USER_LOCAL_DATA_KEY)) || {};

    test.onclick = () => {

    }

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
        split.disabled = true;
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

    function updateGameDataInLocalStorage() {
      USER_LOCAL_DATA[currentUser].localGameData = JSON.stringify(gameData);
      localStorage.setItem(USER_LOCAL_DATA_KEY, JSON.stringify(USER_LOCAL_DATA));
    }

    function updateUserStatsInLocalStorage() {
      USER_LOCAL_DATA[currentUser].localStats = JSON.stringify(userStats);
      localStorage.setItem(USER_LOCAL_DATA_KEY, JSON.stringify(USER_LOCAL_DATA));
    }

    function updateUserStats(state) {
      if (state === GAME_STATE_TYPES.WIN) {
        userStats.wins += 1;
      } else if (state === GAME_STATE_TYPES.BUST) {
        userStats.busts += 1;
      } else if (state === GAME_STATE_TYPES.DRAW) {
        userStats.draws += 1;
      } else if (state === "blackjack") {
        userStats.blackjacks += 1;
      }
    }

    async function startGame() {
      try {
        displayScores("comp");
        displayScores("player");
        await printCompCards();
        await delay(250);
        await printPlayerCards();
        await delay(250);
        await printCompCards();
        await delay(250);
        await printPlayerCards();
        await delay(250);
        await startGameFlipCard();
        displayCurrentBet();

        await delay(500);
        if (gameData.playerScore === 21) {
          changeButtonFunction("off", "all");
          setGameState("player");
          gameData.roundEnded = true;

          gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
          gameData.playerCredits += gameData.currentBet;
          fadeIn(gameMessageBubble, 50);

          gameMessageBubble.innerHTML = `BLACKJACK! YOU WON ${gameData.currentBet} CREDITS`
          await fadeIn(gameMessageBubble);

          displayCredits();
          updateUserStats(gameData.playerGameState);
          updateUserStats("blackjack");
          await delay(2000);
          newRoundTimer()
        }
        changeButtonFunction("on", "player");

        if (gameData.playerHand[0].value === gameData.playerHand[1].value) {
          changeButtonFunction("on", "split")
        }

      } catch (error) {
        console.log(error);
      }
    }

    async function pressPlaceBetButton() {
      if (gameData.currentBet === 0) {
        gameMessageBubble.innerHTML = `Place a bet first!`;
        fadeIn(gameMessageBubble, 50);
      } else {
        changeButtonFunction("off", "bet");
        displayStartingMessage("off");
        if (gameData.newRound === true) {
          await endGameFadeOut("off");
        }
        gameData.previousBet = gameData.currentBet;
        console.log(gameData.currentBet, "current bet")

        await startGame();
        await delay(100);

        gameData.playerCredits -= gameData.currentBet;
        updateGameDataInLocalStorage();
        displayCredits();
        fadeIn(playerCreditsBubble, 50);
      }
    }

    async function pressHitButton() {
      changeButtonFunction("off", "player");
      await printPlayerCards();

      if (gameData.finalDraw) {
        setGameState("player");
        setGameState("comp");
        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.deckSplit);
        gameData.playerCredits += gameData.currentBet;
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        displayCredits();
        updateUserStats(gameData.playerGameState);
      }

      if (gameData.playerScore > 21) {
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        setGameState("player");
        setGameState("comp");

        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        fadeIn(gameMessageBubble, 50);
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        updateUserStats(gameData.playerGameState);
        await delay(2000);
        newRoundTimer();
      } else if (gameData.playerScore === 21) {
        setGameState("player")
        setGameState("comp")
        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.deckSplit);
        gameData.playerCredits += gameData.currentBet;
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        displayCredits();
        fadeIn(gameMessageBubble, 50);
        fadeIn(playerCreditsBubble, 50);
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        updateUserStats(gameData.playerGameState);
        updateUserStats("blackjack");
        await delay(2000);
        newRoundTimer();
      } else {
        changeButtonFunction("on", "player");
      }

      setGameState("player");
      setGameState("comp");

      if (gameData.playerGameState !== '' || gameData.compGameState !== '') {
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

        let lower16 = (gameData.compScore >= 16 && gameData.compScore >= gameData.playerScore && gameData.compScore <= 21)
        let lower21 = (gameData.compScore >= 17 && gameData.compScore >= gameData.playerScore && gameData.compScore <= 21);
        let higher21 = (gameData.compScore >= 17 && gameData.compScore > 21);
        let lowerThanPlayer = (gameData.compScore >= 17 && gameData.compScore <= gameData.playerScore && gameData.compScore < 21);

        if (lower21 || higher21 || lower16 || lowerThanPlayer) {
          console.log(gameData.currentBet, "cb in while")
          gameData.finalDraw = true;
          setGameState("player");
          setGameState("comp");
          console.log(gameData.playerGameState, gameData.compGameState, "small21");

          gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.deckSplit);
          gameData.playerCredits += gameData.currentBet;
          fadeIn(playerCreditsBubble, 50);
          displayCredits();
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
          fadeIn(gameMessageBubble, 50);
          updateUserStats(gameData.playerGameState);
          break;
        }
      }

      if (gameData.compHand.length <= 2) {
        if (gameData.compScore >= 17 && (gameData.compScore < gameData.playerScore) && gameData.compScore < 21) {
          gameData.over17Bust = true;
          console.log("BUST")
        } else if (gameData.compScore >= 17 && (gameData.compScore === gameData.playerScore) && gameData.compScore <= 21) {
          gameData.over17Draw = true;
          console.log("BUST")
        } else if (gameData.compScore >= 17 && (gameData.compScore > gameData.playerScore) && gameData.compScore <= 21) {
          gameData.over17Win = true;
          console.log("BUST")
        }

        if (gameData.over17Bust || gameData.over17Draw || gameData.over17Win) {
          console.log(gameData.currentBet, "cb out while")

          gameData.finalDraw = true;
          setGameState("player");
          setGameState("comp");
          console.log(gameData.playerGameState, gameData.compGameState, "PCGS");

          gameData.previousBet *= decideBetReturn(gameData.playerGameState, gameData.deckSplit);
          gameData.playerCredits += gameData.currentBet;
          fadeIn(playerCreditsBubble, 50);

          displayCredits();
          gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
          fadeIn(gameMessageBubble, 50);
          updateUserStats(gameData.playerGameState);
        }
      }



      if (gameData.playerGameState !== '' && gameData.compGameState !== '') {
        gameData.roundEnded = true;
        await delay(2000);
        newRoundTimer();
      }
      newRoundTimer();
    }

    async function pressDoubleDownButton() {
      await printPlayerCards();

      setGameState("player");
      setGameState("comp");

      if (gameData.playerScore > 21) {
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        setGameState("player");
        setGameState("comp");
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        fadeIn(gameMessageBubble, 50);
        changeButtonFunction("off", "all");
        gameData.roundEnded = true;
        updateUserStats(gameData.playerGameState);
        await delay(2000);
        newRoundTimer();
      } else if (gameData.playerScore === 21) {
        setGameState("player")
        setGameState("comp")
        gameData.playerBlackjack = true;
        gameData.currentBet *= decideBetReturn(gameData.playerGameState, gameData.compGameState);
        gameData.playerCredits += gameData.currentBet;
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.playerGameState);
        displayCredits();
        fadeIn(gameMessageBubble, 50);
        changeButtonFunction("off", "all");
        updateUserStats(gameData.playerGameState);
        updateUserStats("blackjack");
        gameData.roundEnded = true;
        await delay(2000);
        newRoundTimer();
      } else {
        await delay(1000);
        pressStandButton();
      }
    }

    async function pressSplitButton() {
      gameData.deckSplit = true
      gameData.splitBet1 = gameData.currentBet;

      hit.removeEventListener("click", pressHitButton);
      hit.addEventListener("click", pressSplitHitButton);
      stand.removeEventListener("click", pressStandButton);
      stand.addEventListener("click", pressSplitStandButton);
      placeBet.removeEventListener("click", pressPlaceBetButton);
      placeBet.addEventListener("click", pressSplitPlaceBetButton);

      console.log(gameData.splitBet1, gameData.splitBet2, "splitonclick")

      await hideUserScore("player");
      await printSplitContainer();
      await delay(200);
      await printFirstSplitCards();
      await displaySplitScores();
      await delay(200);
      await printSplitCards(1);
      await delay(200);
      await printSplitCards(2);
      displayCurrentBet(gameData.deckSplit, 1);
      displayCurrentBet(gameData.deckSplit, 2);
      await setSplitDeckBet();
      console.log(gameData.splitBet1, gameData.splitBet2, "splitonclick")

    }

    async function pressSplitPlaceBetButton() {

      displayCurrentBet(gameData.deckSplit);

      changeButtonFunction("off", "split")
      changeButtonFunction("off", "bet");
      changeButtonFunction("on", "player");
      gameData.playerCredits -= splitBet1;
      displayCredits();

      await fadeOut(gameMessageBubble, 50);
      gameMessageBubble.innerHTML = '';

      if (gameData.splitScore1 === 21) {
        setGameState("player", 1, gameData.deckSplit);
        setGameState("comp")
        gameData.splitBet1 *= decideBetReturn(gameData.splitState1, gameData.deckSplit);
        gameData.playerCredits += gameData.splitBet1;
        gameMessageBubble.innerHTML = printGameState(gameData.compGameState, gameData.splitState1);
        displayCredits();
        fadeIn(gameMessageBubble, 50);
        pressSplitStandButton();
        updateUserStats(gameData.playerGameState);
        updateUserStats("blackjack");
      }
    }

    async function pressSplitHitButton() {
      let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");

      if (gameData.splitSwitch === false) {
        changeButtonFunction("off", "player");
        await printSplitCards(1);
        countUserScore("player", gameData.deckSplit, 1);

        if (gameData.splitScore1 > 21) {

          changeButtonFunction("off", "all");
          setGameState("player", 1, gameData.deckSplit);
          setGameState("comp");
          gameMessageBubble.innerHTML = printSplitGameMessage(gameData.splitState1, gameData.splitBet1, 1);
          await delay(500);
          pressSplitStandButton();
          changeButtonFunction("on", "player");
          updateUserStats(gameData.playerGameState);

        } else if (gameData.splitScore1 === 21) {
          gameData.playerBlackjack = true;
          changeButtonFunction("off", "all");
          setGameState("player", 1, gameData.deckSplit);
          setGameState("comp");
          gameData.playerCredits += gameData.splitBet1;
          displayCredits();
          await delay(1000);
          changeButtonFunction("on", "player");
          gameData.playerBlackjack = false;
          pressSplitStandButton();
          updateUserStats(gameData.playerGameState);
          updateUserStats("blackjack");

        } else {
          changeButtonFunction("on", "player");
        }
      } else {

        await printSplitCards(2);
        countUserScore("player", gameData.deckSplit, 2);

        if (gameData.splitScore2 > 21) {
          innerScoreWrapper2.classList.remove("active");
          setGameState("player", 2, gameData.deckSplit);
          setGameState("comp");
          gameMessageBubble.innerHTML = printSplitGameMessage(gameData.splitState2, gameData.splitBet2, 2);
          fadeIn(gameMessageBubble, 50);
          pressSplitStandButton();
          changeButtonFunction("off", "all");
          updateUserStats(gameData.playerGameState);

        } else if (gameData.splitScore2 === 21) {
          setGameState("player", 2, gameData.deckSplit);
          setGameState("comp");

          gameData.playerCredits += gameData.splitBet2;
          gameMessageBubble.innerHTML = printSplitGameMessage(gameData.splitState2, gameData.splitBet2, 2);
          fadeIn(gameMessageBubble, 50);
          displayCredits();
          innerScoreWrapper2.classList.remove("active");
          gameData.playerBlackjack = false;
          updateUserStats(gameData.playerGameState);
          updateUserStats("blackjack");
          pressSplitStandButton();

        } else {
          changeButtonFunction("on", "player");
        }

      }
      if (gameData.splitState1 !== '' || gameData.splitState2 !== '') {
        gameData.roundEnded = true;
      }
    }

    async function pressSplitStandButton() {
      let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
      let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");

      setGameState("player", 1, gameData.deckSplit);
      setGameState("player", 2, gameData.deckSplit);

      innerScoreWrapper1.classList.remove("active");
      innerScoreWrapper2.classList.add("active");

      await fadeOut(gameMessageBubble, 50);
      gameMessageBubble.innerHTML = "";

      if (gameData.splitSwitch === true) {
        if (gameData.splitState1 === GAME_STATE_TYPES.BUST && gameData.splitState2 === GAME_STATE_TYPES.BUST) {
          innerScoreWrapper2.classList.remove("active");
          gameMessageBubble.innerHTML = printSplitFinalMessage(gameData.splitState1, gameData.splitBet1, gameData.splitState2, gameData.splitBet2);
          fadeIn(gameMessageBubble, 50);
          gameData.roundEnded = true;
          updateUserStats(gameData.splitState1);
          updateUserStats(gameData.splitState2);
          updateUserStats("blackjack");
          await delay(1500);
          newRoundTimer();
        } else {
          changeButtonFunction("off", "all");
          await handleSecondCard();

          innerScoreWrapper2.classList.remove("active");

          if (gameData.compScore >= 17 && (gameData.compScore < gameData.splitScore1 || gameData.compScore < gameData.splitScore2) && gameData.compScore <= 21) {
            gameData.over17Bust = true;
          } else if (gameData.compScore >= 17 && (gameData.compScore <= gameData.splitScore1 || gameData.compScore <= gameData.splitScore2) && gameData.compScore <= 21) {
            gameData.over17Draw = true;
          }

          while (gameData.compScore <= 16) {
            await delay(500);
            await printCompCards();
            setGameState("player", 1, gameData.deckSplit);
            setGameState("player", 2, gameData.deckSplit);
            setGameState("comp");

            if (gameData.compScore >= 17 && gameData.compScore <= 21) {
              gameData.finalDraw = true;
              setGameState("player", 1, gameData.deckSplit);
              setGameState("player", 2, gameData.deckSplit);
              setGameState("comp");
              console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS IN")

              gameData.splitBet2 *= decideBetReturn(gameData.splitState2, gameData.deckSplit);
              console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS after");

              gameData.playerCredits += gameData.splitBet1 + gameData.splitBet2;
              gameMessageBubble.innerHTML = printSplitFinalMessage(gameData.splitState1, gameData.splitBet1, gameData.splitState2, gameData.splitBet2);
              fadeIn(gameMessageBubble, 50);
              updateUserStats(gameData.splitState1);
              updateUserStats(gameData.splitState2);
              console.log(gameData.splitState1, gameData.splitState2, "SPLIT STATES")
              console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS OUT")
              break;
            } else if (gameData.compScore > 21) {
              gameData.roundEnded = true;
              setGameState("player", 1, gameData.deckSplit);
              setGameState("player", 2, gameData.deckSplit);
              setGameState("comp");
              gameData.splitBet2 *= decideBetReturn(gameData.splitState2, gameData.deckSplit);
              console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS after")


              gameData.playerCredits += gameData.splitBet1 + gameData.splitBet2;
              gameMessageBubble.innerHTML = printSplitFinalMessage(gameData.splitState1, gameData.splitBet1, gameData.splitState2, gameData.splitBet2);
              fadeIn(gameMessageBubble, 50);
              updateUserStats(gameData.splitState1);
              updateUserStats(gameData.splitState2);
              break
            }
          }

          if (gameData.over17Bust || gameData.over17Draw) {
            gameData.finalDraw = true;
            setGameState("player", 1, gameData.deckSplit);
            setGameState("player", 2, gameData.deckSplit);
            setGameState("comp");
            console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS whileout")
            console.log(gameData.splitState2, gameData.splitState2, "SPLIT state whileout")

            gameData.splitBet2 *= decideBetReturn(gameData.splitState2, gameData.deckSplit);
            console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS after whileout")

            gameData.playerCredits += gameData.splitBet1 + gameData.splitBet2;
            gameMessageBubble.innerHTML = printSplitFinalMessage(gameData.splitState1, gameData.splitBet1, gameData.splitState2, gameData.splitBet2);
            fadeIn(gameMessageBubble, 50);
            updateUserStats(gameData.splitState1);
            updateUserStats(gameData.splitState2);
            console.log(gameData.splitState1, gameData.splitState2, "SPLIT STATES whileout")
            console.log(gameData.splitBet1, gameData.splitBet2, "SPLIT BETS OUT whileout")
          }
        }

        if (gameData.splitState1 !== '' && gameData.splitState2 !== '') {
          gameData.roundEnded = true;
        }
      }

      setGameState("player", 1, gameData.deckSplit);
      setGameState("comp");
      displayCredits();
      updateUserStats(gameData.splitState1);
      updateUserStats(gameData.splitState2);
      gameData.splitSwitch = true;
    }

    async function printFirstSplitCards() {
      let splitContainer1 = document.querySelector(".split-cards-container1");
      let splitContainer2 = document.querySelector(".split-cards-container2");
      let innerScoreDiv1 = document.querySelector(".split-inner-score1");
      let innerScoreDiv2 = document.querySelector(".split-inner-score2")

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
        gameData.splitCardDist1 += 7.5;
        cardElem.style.top = "20%";

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
        gameData.splitCardDist2 += 7.5;
        cardElem.style.top = "20%";

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
    }

    async function printSplitCards(deckNumber) {
      let splitContainer1 = document.querySelector(".split-cards-container1");
      let splitContainer2 = document.querySelector(".split-cards-container2");
      let innerScoreDiv1 = document.querySelector(".split-inner-score1");
      let innerScoreDiv2 = document.querySelector(".split-inner-score2");
      let splitCards1 = splitContainer1.querySelectorAll(".card-holder");
      let splitCards2 = splitContainer2.querySelectorAll(".card-holder");

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

        cardElem.style.top = "20%";

        if (deckNumber === 1) {
          cardElem.style.left = gameData.splitCardDist1 + "px";
          gameData.splitCardDist1 += 7.5;

          splitContainer1.appendChild(cardElem);
          await delay(250);

          card.bjVal = +getValueByCardType(card.value, "player", 1);
          gameData.splitCardArray[0].push(card);
          gameData.splitScoreArray[0].push(+card.bjVal);
          await delay(100);
          countUserScore("player", gameData.deckSplit, 1);
          fadeIn(innerScoreDiv1, 50);
          fadeIn(cardElem, 25);
          splitCards1.forEach(card => {
            let currentLeft = parseFloat(card.style.left);
            card.style.left = (currentLeft + (-7.5)) + "px";
          })
          await delay(250);
          await flipLastCard("player", gameData.deckSplit, 1);


        } else {
          cardElem.style.left = gameData.splitCardDist2 + "px";
          gameData.splitCardDist2 += 7.5;

          splitContainer2.appendChild(cardElem);
          await delay(250);

          card.bjVal = +getValueByCardType(card.value, "player", 2);
          gameData.splitCardArray[1].push(card);
          gameData.splitScoreArray[1].push(+card.bjVal);
          await delay(100);
          countUserScore("player", gameData.deckSplit, 2);
          fadeIn(innerScoreDiv2, 50);
          fadeIn(cardElem, 25);
          splitCards2.forEach(card => {
            let currentLeft = parseFloat(card.style.left);
            card.style.left = (currentLeft + (-7.5)) + "px";
          })
          flipLastCard("player", gameData.deckSplit, 2);
        }
      }


    }

    async function setSplitDeckBet() {
      await delay(250);
      gameMessageBubble.innerHTML = "Place a bet for the second deck";
      fadeIn(gameMessageBubble, 50);
      gameData.currentBet = 0

      changeButtonFunction("off", "player");
      changeButtonFunction("off", "split");
      changeButtonFunction("on", "bet");
    }

    async function printSplitContainer() {
      let playerScoreSplitBubble = document.querySelector(".player-score-bubble-wrapper");
      let currentPlayerCards = playerCardsContainer.querySelectorAll(".ard-holder");

      for (let card of currentPlayerCards) {
        await fadeOut(card, 50);
      }
      await delay(550);
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

      gameData.splitCardDist1 = (splitContainer1.clientWidth / 2) - (105 / 2);
      gameData.splitCardDist2 = (splitContainer2.clientWidth / 2) - (105 / 2);

      innerScoreWrapper1.classList.add("active");
    }

    async function printPlayerCards() {
      let allPlayerCards = playerCardsContainer.querySelectorAll(".card-holder");

      if (!gameData.deckID) {
        console.error("Deck ID is not set.");
        return;
      }


      let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameData.deckID}/draw/?count=1`);
      let drawData = await draw.json();
      let playerCards = drawData.cards;
      console.log(drawData, "deck");
      console.log(gameData.playerHand)
      for (let card of playerCards) {
        if (card.value === "JACK") {
          card.image = "images/jackofclubs.jpg"
        }
        card.backImage = "https://deckofcardsapi.com/static/img/back.png";
        card.bjVal = getValueByCardType(card.value, "player");

        gameData.playerScoreArray.push(+card.bjVal);

        gameData.playerHand.push(card);

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

        playerCardsContainer.appendChild(cardElem);
        await delay(100);
        fadeIn(cardElem, 75);

        cardElem.style.transition = "left 1s ease-in-out";
        cardElem.style.left = gameData.playerCardDist + "px";
        gameData.playerCardDist += 52.5;

        if (gameData.playerHand.length > 2) {
          await delay(500);
          flipLastCard("player");
        }

        allPlayerCards.forEach(item => {
          let currentLeft = parseFloat(item.style.left);
          item.style.left = (currentLeft + (-52.5)) + "px";
        })
      }
      setGameState("player");
      countUserScore("player");
    }

    async function printCompCards() {
      let allCompCards = compContainer.querySelectorAll(".card-holder");

      if (!gameData.deckID) {
        console.error("Deck ID is not set.");
        return;
      }

      let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${gameData.deckID}/draw/?count=1`);
      let drawData = await draw.json();
      let compCards = drawData.cards;


      for (let card of compCards) {
        if (card.value === "JACK") {
          card.image = "images/jackofclubs.jpg"
        }
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
          cardElem.style.top = "10%";

          compContainer.appendChild(cardElem);
          await delay(100);
          fadeIn(cardElem, 75);

          cardElem.style.transition = "left 1s ease-in-out";
          cardElem.style.left = gameData.compCardDist + "px";
          gameData.compCardDist += 52.5;

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
          cardElem.style.top = "10%";


          compContainer.appendChild(cardElem);
          await delay(500);
          fadeIn(cardElem, 75);

          cardElem.style.transition = "left 1s ease-in-out";
          cardElem.style.left = gameData.compCardDist + "px";
          gameData.compCardDist += 52.5;

        }
        allCompCards.forEach(item => {
          let currentLeft = parseFloat(item.style.left);
          item.style.left = (currentLeft + (-52.5)) + "px";
        })

        setGameState("comp")
      }

      countUserScore("comp");
    }

    function addBet() {
      if (gameData.deckSplit === true) {
        let splitBet2 = document.querySelector(".split-bet2");


        counter2 = 0;
        counter2 += gameData.minimumBet;
        gameData.splitBet2 += counter2;
        console.log(gameData.splitBet1, gameData.splitBet2, counter2, "splitonclick in add")
        splitBet2.innerHTML = `$${gameData.splitBet2}`;
        fadeIn(splitBet2, 50);

      } else {
        let currentBetDisplay = document.querySelector(".bet-display-current-bet");

        if (gameData.currentBet === gameData.playerCredits) {
          gameData.currentBet = gameData.playerCredits;
          gameMessageBubble.innerHTML = `You do not have enough credits`;
        } else {
          gameData.currentBet += gameData.minimumBet;
          currentBetDisplay.innerHTML = `$${gameData.currentBet}`
          fadeIn(currentBetDisplay, 50);
        }
      }
    }

    function subtractBet() {
      if (gameData.deckSplit === true) {
        let splitBet2 = document.querySelector(".split-bet2");

        gameData.splitBet2 -= gameData.minimumBet;
        splitBet2.innerHTML = `$${gameData.splitBet2}`;
        console.log(gameData.splitBet1, gameData.splitBet2, "splitonclick in subtract")

        fadeIn(splitBet2, 50);
      } else {
        let currentBetDisplay = document.querySelector(".bet-display-current-bet");

        if (gameData.currentBet <= 0) {
          gameData.currentBet = 0;
          gameMessageBubble.innerHTML = `You do not have enough credits`;
        } else {
          gameData.currentBet -= gameData.minimumBet;
          currentBetDisplay.innerHTML = `$${gameData.currentBet}`;
          fadeIn(currentBetDisplay, 50);
        }
      }
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
              } else {
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

    function displayStartingMessage(display) {
      if (display === "on") {
        gameMessageBubble.innerHTML = "Place Your Bet";
        fadeIn(gameMessageBubble, 50);
      } else {
        fadeOut(gameMessageBubble, 50);
      }
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
      innerDiv.innerHTML = `Total Credits: ${gameData.playerCredits}`;
    }

    async function hideUserScore(user) {
      if (user === "player") {
        let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");
        let betDisplay = document.querySelector(".bet-display");

        await fadeOut(betDisplay, 50);
        await fadeOut(playerCardsContainer.children[0], 65);
        await fadeOut(playerCardsContainer.children[1], 65);
        await fadeOut(playerScoreBubbleWrapper, 50);
        await fadeOut(playerScoreBubble, 50);
        playerScoreBubbleWrapper.classList.remove("active");
      } else {
        let compScoreBubbleWrapper = document.querySelector(".comp-score-bubble-wrapper");

        await fadeOut(compScoreBubbleWrapper, 50);
        await fadeOut(compScoreBubble, 50);
        compScoreBubbleWrapper.classList.remove("active");
      }
    }

    async function displayScores(user) {
      if (user === "player") {
        let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");

        playerScoreBubbleWrapper.classList.add("active");
        await fadeIn(playerScoreBubbleWrapper, 50);
        playerScoreBubble.innerHTML = 0;
        fadeIn(playerScoreBubble, 50);
      } else {
        let compScoreBubbleWrapper = document.querySelector(".comp-score-bubble-wrapper");

        compScoreBubbleWrapper.classList.add("active");
        await fadeIn(compScoreBubbleWrapper, 50);
        compScoreBubble.innerHTML = 0;
        fadeIn(playerScoreBubble, 50);
      }
    }

    async function displaySplitScores() {
      let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
      let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");

      fadeIn(innerScoreWrapper1);
      fadeIn(innerScoreWrapper2);
    }

    function displayCurrentBet(split, deckNumber) {
      if (split) {
        if (deckNumber === 1) {
          let splitContainer1 = document.querySelector(".split-cards-container1");
          let splitBet1 = document.createElement("div");
          splitBet1.classList.add("split-bet1");
          let splitBetRight1 = (splitContainer1.clientWidth / 2) - 110;
          splitBet1.style.right = splitBetRight1 + "px";
          splitBet1.innerHTML = `Deck 1: $${gameData.splitBet1}`;
          splitContainer1.appendChild(splitBet1);
          fadeIn(splitBet1, 50);
        } else {
          let splitContainer2 = document.querySelector(".split-cards-container2");
          let splitBet2Wrapper = document.createElement("div");
          splitBet2Wrapper.classList.add("split-bet2-wrapper");
          let splitBetRight2 = (splitContainer2.clientWidth / 2) - 110;
          splitBet2Wrapper.style.right = splitBetRight2 + "px";
          splitBet2Wrapper.innerHTML =
            `
            <div class="split-bet2-text">
              Deck 2: 
            </div>
            <div class="split-bet2">
              $${gameData.splitBet2}
            </div>
          `

          splitContainer2.appendChild(splitBet2Wrapper);
        }

      } else {
        let betDisplayElem = document.createElement("div");
        betDisplayElem.classList.add("bet-display");

        let betDisplayRight = (playerCardsContainer.clientWidth / 2) - 145;
        betDisplayElem.style.right = betDisplayRight + "px";

        betDisplayElem.innerHTML =
          `
        <div class="bet-display-text">
        Current Bet: 
        </div>
        <div class="bet-display-current-bet">
        $${gameData.currentBet}
        </div>
        `;

        playerCardsContainer.appendChild(betDisplayElem);
        fadeIn(betDisplayElem, 50);
      }
    }

    async function startGameFlipCard() {
      compFirstCard = compContainer.querySelector(".card-holder:nth-child(1)");
      playerFirstCard = playerCardsContainer.querySelector(".card-holder:nth-child(2)");
      playerSecondCard = playerCardsContainer.querySelector(".card-holder:nth-child(3)");

      compFirstCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      await delay(150);

      playerFirstCard.querySelector(".card-face").classList.toggle("card-face-flipped");
      await delay(150);

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
          gameData.compGameState = stateLogicSetter(gameData.compScore, gameData.playerScore, gameData.standClicked);
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

    function decideBetReturn(userState, deckSplit) {
      if (deckSplit) {
        if (userState === GAME_STATE_TYPES.WIN) {
          return 2.5;
        } else if (userState === GAME_STATE_TYPES.DRAW) {
          return 1;
        } else if (userState === GAME_STATE_TYPES.BUST) {
          return 0;
        }
      } else {
        if (userState === GAME_STATE_TYPES.WIN) {
          return 2.5;
        } else if (userState === GAME_STATE_TYPES.WIN) {
          return 2.9;
        } else if (userState === GAME_STATE_TYPES.DRAW) {
          return 1;
        } else if (userState === GAME_STATE_TYPES.BUST) {
          return 0;
        }
      }
    }

    function resetGameData() {
      gameData.playerHand = [];
      gameData.playerScore = 0;
      gameData.playerGameState = '';
      gameData.playerScoreArray = [];

      gameData.compHand = [];
      gameData.compScore = 0;
      gameData.compGameState = '';
      gameData.compScoreArray = [];

      gameData.standClicked = false;
      gameData.finalDraw = false;
      gameData.roundEnded = false;
      gameData.currentBet = 0;
      over17Bust = false;
      over17Draw = false;
      over17Win = false;

      playerScoreBubble.innerHTML = 0;
      compScoreBubble.innerHTML = 0;

      gameData.deckSplit = false;
      gameData.splitSwitch = false;
      gameData.newRound = true;
      gameData.splitScore1 = 0;
      gameData.splitScore2 = 0;
      gameData.splitCardArray = [[], []];
      gameData.splitScoreArray = [[], []];
      gameData.splitState1 = "";
      gameData.splitState2 = "";
      gameData.splitCardDist1 = 0;
      gameData.splitCardDist2 = 0;
      gameData.splitBet1 = 0;
      gameData.splitBet2 = 0;

      gameData.playerCardDist = (playerCardsContainer.clientWidth / 2) - (105 / 2);
      gameData.compCardDist = (compContainer.clientWidth / 2) - (105 / 2);

      placeBet.removeEventListener("click", pressSplitPlaceBetButton);
      placeBet.addEventListener("click", pressPlaceBetButton);
      hit.removeEventListener("click", pressSplitHitButton);
      hit.addEventListener("click", pressHitButton);
      stand.removeEventListener("click", pressSplitStandButton);
      stand.addEventListener("click", pressStandButton);
    }

    async function newRoundTimer() {
      let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");
      let splitScore1 = document.querySelector(".split-cards-score1");
      let splitScore2 = document.querySelector(".split-cards-score2");

      changeButtonFunction("off", "all")
      if (gameData.roundEnded) {
        let count = 3;

        gameMessageBubble.innerHTML = `New round in ${count}`;

        async function updateCountdown() {
          count--;
          gameMessageBubble.innerHTML = `New round in ${count}`;

          if (count === 0) {
            clearInterval(countdownInterval);

            await endGameFadeOut("on");
            await delay(500);
            gameMessageBubble.innerHTML = "Place Your Bet";
            await fadeIn(gameMessageBubble, 100);
            await delay(1000);

            if (gameData.deckSplit) {
              playerScoreBubbleWrapper.classList.remove("split");
              playerScoreBubbleWrapper.removeChild(splitScore1);
              playerScoreBubbleWrapper.removeChild(splitScore2);
              playerScoreBubbleWrapper.appendChild(playerScoreBubble);
            } else {
              playerScoreBubbleWrapper.classList.remove("split");
              playerScoreBubbleWrapper.appendChild(playerScoreBubble);
            }

            resetGameData();
            console.log(gameData, "after clear");
            updateGameDataInLocalStorage();
            updateUserStatsInLocalStorage();
            playerCardsContainer.innerHTML = '';
            compContainer.innerHTML = '';
            changeButtonFunction("off", "player");
            changeButtonFunction("on", "bet");
            displayCurrentBet(gameData.deckSplit);
            fadeIn(playerCardsContainer, 50);
          }
        }
        let countdownInterval = setInterval(updateCountdown, 1000);
      }
    }

    async function endGameFadeOut(state) {
      let innerScoreWrapper1 = document.querySelector(".inner-score-wrapper1");
      let innerScoreWrapper2 = document.querySelector(".inner-score-wrapper2");
      let compScoreBubbleWrapper = document.querySelector(".comp-score-bubble-wrapper");
      let playerScoreBubbleWrapper = document.querySelector(".player-score-bubble-wrapper");
      let betDisplay = document.querySelector(".bet-display");
      let splitContainer1 = document.querySelector(".split-cards-container1");
      let splitContainer2 = document.querySelector(".split-cards-container2");

      if (state === "on") {
        if (gameData.deckSplit === true) {
          await fadeOut(splitContainer1, 75);
          await fadeOut(splitContainer2, 75);
          await fadeOut(compContainer, 75);
          await fadeOut(compScoreBubble, 50);
          await fadeOut(compScoreBubbleWrapper, 50);
          await fadeOut(innerScoreWrapper1, 50);
          await fadeOut(innerScoreWrapper2, 50);
          await fadeOut(gameMessageBubble, 50);
        } else {
          await fadeOut(playerCardsContainer, 75);
          await fadeOut(compContainer, 75);
          await fadeOut(compScoreBubble, 50);
          await fadeOut(compScoreBubbleWrapper, 50);
          await fadeOut(playerScoreBubble, 50);
          await fadeOut(playerScoreBubbleWrapper, 50);
          await fadeOut(betDisplay, 50);
          await fadeOut(gameMessageBubble, 50);
        }
      } else {
        await fadeIn(playerCardsContainer, 50);
        await fadeIn(compContainer, 50);
        await fadeIn(compScoreBubble, 50);
        await fadeIn(compScoreBubbleWrapper, 50);
        await fadeIn(playerScoreBubble, 50);
        await fadeIn(playerScoreBubbleWrapper, 50);
      }
    }

    // function screenMessageAnimation(element, ms) {
    //   let completeCount;
    //   let newText;

    //   const array = element.textContent.split('')
    //   const special = ['~', '@', '!', '#', '$', '%', '^', '&', '*']
    //   const exception = [' ', '\n', '.', ',']
    //   const random = (min, max) => {
    //     return Math.floor(Math.random() * (max - min + 1) + min)
    //   }

    //   const numArray = []
    //   array.forEach(char => {
    //     const num = random(5, 40)
    //     numArray.push(num)
    //   })

    //   const timer = setInterval(() => {
    //     completeCount = 0
    //     newText = ''
    //     numArray.forEach((num, i) => {
    //       if (exception.includes(array[i]) || numArray[i] === 0) {
    //         newText += array[i]
    //         completeCount += 1
    //       } else {
    //         newText += special[numArray[i] % special.length]
    //         numArray[i] = --num
    //       }
    //     })

    //     element.innerText = newText
    //     if (completeCount === numArray.length) clearInterval(timer)
    //   }, ms)
    // }

    function printGameState(opponentState, userState) {
      console.log(gameData.currentBet, "cb in printgamestate")

      if (userState === GAME_STATE_TYPES.WIN) {
        return `YOU WON ${gameData.currentBet} CREDITS`;
      } else if (opponentState === GAME_STATE_TYPES.DRAW) {
        return `DRAW: Returned ${gameData.currentBet} CREDITS`;
      } else if (opponentState === GAME_STATE_TYPES.BUST) {
        return `YOU WON ${gameData.currentBet} CREDITS`;
      }
      return `YOU LOST ${gameData.currentBet} CREDITS`
    }

    function printSplitFinalMessage(deckState, deckBet, deckState2, deckBet2) {
      if (deckState === GAME_STATE_TYPES.WIN && deckState2 === GAME_STATE_TYPES.WIN) {
        return `YOU WON ${(deckBet + deckBet2)} CREDITS`;
      } else if ((deckState === GAME_STATE_TYPES.WIN && deckState2 === GAME_STATE_TYPES.BUST) || (deckState === GAME_STATE_TYPES.WIN && deckState2 === GAME_STATE_TYPES.DRAW)) {
        return `YOU WON ${deckBet} CREDITS`;
      } else if ((deckState === GAME_STATE_TYPES.BUST && deckState2 === GAME_STATE_TYPES.WIN) || (deckState === GAME_STATE_TYPES.DRAW && deckState2 === GAME_STATE_TYPES.WIN)) {
        return `YOU WON ${deckBet2} CREDITS`;
      } else if (deckState === GAME_STATE_TYPES.BUST && deckState2 === GAME_STATE_TYPES.BUST) {
        return `YOU LOST ${deckBet + deckBet2} CREDITS`;
      } else if (deckState === GAME_STATE_TYPES.BUST && deckState2 === GAME_STATE_TYPES.DRAW) {
        return `RETURNED ${deckBet2} CREDITS`;
      } else if (deckState === GAME_STATE_TYPES.DRAW && deckState2 === GAME_STATE_TYPES.BUST) {
        return `RETURNED ${deckBet} CREDITS`;
      } else if (deckState === GAME_STATE_TYPES.DRAW && deckState2 === GAME_STATE_TYPES.DRAW) {
        return `RETURNED ${deckBet + deckBet2} CREDITS`;
      }
    }

    function printSplitGameMessage(deckState, deckBet, deckNumber) {
      if (gameData.deckSplit === true) {
        if (deckNumber === 1) {
          if (deckState === GAME_STATE_TYPES.WIN) {
            return `Deck 1: YOU WON $${deckBet * 2.5} CREDITS`
          } else if (deckState === GAME_STATE_TYPES.DRAW) {
            return `Deck 1: DRAW - RETURNED $${deckBet} CREDITS`;
          } else if (deckState === GAME_STATE_TYPES.BUST) {
            return `Deck 1: YOU LOST $${deckBet * 2.5} CREDITS`;
          }
        } else if (deckNumber === 2) {
          if (deckState === GAME_STATE_TYPES.WIN) {
            return `Deck 2: YOU WON $${deckBet * 2.5} CREDITS`
          } else if (deckState === GAME_STATE_TYPES.DRAW) {
            return `Deck 2: DRAW - RETURNED $${deckBet} CREDITS`;
          } else if (deckState === GAME_STATE_TYPES.BUST) {
            return `Deck 2: YOU LOST $${deckBet * 2.5} CREDITS`;
          }
        }

      }
    }

    function openSettingsMenu() {
      openSettingsModalButton.onclick = () => {
        settingsModal.showModal();
        settingsModal.style.left = 50 + "%";
        fadeIn(settingsModal, 50);
      }
    }

    async function closeSettingsMenu() {
      let defaultY = -50;
      closeSettingsModalButton.onclick = () => {
        settingsModal.style.left = 150 + "%";
        fadeOut(settingsModal, 50, () => {
          settingsModal.close();
          settingsModal.style.left = defaultY + "%";
        });
      }

    }

    function openRulesMenu() {
      openRulesModalButton.onclick = () => {
        rulesModal.showModal();
        rulesModal.style.top = 14 + "%";
        fadeIn(rulesModal, 50);
      }
    }

    function closeRulesMenu() {
      let defaultX = -100;
      closeRulesModalButton.onclick = () => {
        rulesModal.style.top = 150 + "%";
        fadeOut(rulesModal, 50, () => {
          rulesModal.close();
          rulesModal.style.top = defaultX + "%";

        });
      }

    }

    function openStatsMenu() {
      statsModal.showModal();
      statsModal.style.left = 33 + "%";
      fadeIn(statsModal, 50);
    }

    function closeStatsMenu() {
      let defaultY = 110;
      statsModal.onclick = () => {
        statsModal.style.left = -100 + "%";
        fadeOut(statsModal, 50, () => {
          statsModal.close();
          statsModal.style.left = defaultY + "%";
        });
      }
    }

    function updateSoundEventListeners() {
      allButtons.forEach(button => {
        button.onclick = () => {
          if (SETTINGS_DATA.sound === true) {
            CLICK_SOUND.play();
          } else {
            CLICK_SOUND.pause();
            CLICK_SOUND.currentTime = 0;
          }
        }
      });
    }
    updateSoundEventListeners();

    function handleSoundSettingChange() {
      soundButton.onclick = () => {
        if (soundButton.checked) {
          SETTINGS_DATA.sound = true;
        } else {
          SETTINGS_DATA.sound = false;
        }
      }
    }
    handleSoundSettingChange();

    function changeColorSettings() {
      let topHalf = document.querySelector(".top-half");
      let bottomHalf = document.querySelector(".bottom-half");
      let middleHalf = document.querySelector(".game-message-bubble-wrapper");
      let tableBorder = document.querySelector(".table-border");
      let redButton = document.getElementById("red");
      let greenButton = document.getElementById("green");
      let blueButton = document.getElementById("blue");


      redButton.onclick = () => {
        topHalf.style.background = "#630f0f";
        bottomHalf.style.background = "#630f0f";
        middleHalf.style.background = "#630f0f";
        tableBorder.style.borderColor = "#000000";
      }

      greenButton.onclick = () => {
        topHalf.style.background = "#1B5432";
        bottomHalf.style.background = "#1B5432";
        middleHalf.style.background = "#1B5432";
        tableBorder.style.borderColor = "#A07047";
      }

      blueButton.onclick = () => {
        topHalf.style.background = "#0C588A";
        bottomHalf.style.background = "#0C588A";
        middleHalf.style.background = "#0C588A";
        tableBorder.style.borderColor = "#D7CFC5";
      }
    }

  }

}
init();



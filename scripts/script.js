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

  let deckID;
  let gameStatus = false;

  let playerGameState;
  let playerCardDist = 0;
  let playerCredits = 100000;
  let playerScore = 0;
  const playerHand = [];

  let compGameState;
  let cardDist = 0;
  let compScore = 0;
  const compHand = [];

  window.onload = () => {
    displayCredits();
  };

  start.onclick = async function () {
    try {
      let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=3")
      let data = await response.json();
      deckID = data.deck_id;

      printCompCards();
      printPlayerCards();
      printCompCards();
      printPlayerCards();


      console.log(data)
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

  async function printPlayerCards() {

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let playerCards = drawData.cards;

    playerCards.forEach(card => {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png"

      if (card.value > 1 && card.value < 10) {
        card.bjVal = card.value;
      }

      switch (card.value) {
        case "10":
          card.bjVal = 10;
          break;
        case "JACK":
          card.bjVal = 10;
          break;
        case "QUEEN":
          card.bjVal = 10;
          break;
        case "KING":
          card.bjVal = 10;
          break;
        case "ACE":
          let result = confirm("OK: 1 | CANCEL: 11");

          if (result) {
            card.bjVal = 1
          } else {
            card.bjVal = 11
          }
          break
      }

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
      console.log(playerHand)
    })
  }

  async function printCompCards() {
    let compContainer = document.querySelector(".comp-container");

    let draw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`);
    let drawData = await draw.json();
    let compCards = drawData.cards;

    compCards.forEach(card => {

      card.backImage = "https://deckofcardsapi.com/static/img/back.png"

      if (card.value > 1 && card.value < 10) {
        card.bjVal = card.value;
      }

      switch (card.value) {
        case "10":
          card.bjVal = 10;
          break;
        case "JACK":
          card.bjVal = 10;
          break;
        case "QUEEN":
          card.bjVal = 10;
          break;
        case "KING":
          card.bjVal = 10;
          break;
        case "ACE":
          card.bjVal1 = 1;
          card.bjVal11 = 11;
          break
      }

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
        console.log(compHand)
      }
    })
  }

  function countScore(x) {
    if (x === "player") {
      let pScoreCount = document.querySelector(".pScore");
      let gamestageMsg = document.querySelector(".gamestage-message");

      let countPlayer = 0;
      playerScore = countPlayer;


      playerHand.forEach(card => {
        countPlayer += Number(card.bjVal);
        pScoreCount.innerHTML = countPlayer;

        if (countPlayer > 21) {
          gamestageMsg.innerHTML = "BUST";
        } else if (countPlayer === 21) {
          gamestageMsg.innerHTML = "WIN";
        }
      })
    } else if (x === "comp") {
      let cScore = document.querySelector(".cScore");
      let compGamestageMsg = document.querySelector(".message");

      let countComp = 0;
      compScore = countComp;
      compHand.forEach((card, index) => {
        if (index !== 1) {
          if (card.value !== "ACE") {
            countComp += Number(card.bjVal);
          } else {
            if (countComp + Number(card.bjVal11) > 21) {
              countComp += Number(card.bjVal1)
            } else if (countComp + card.bjVal11 <= 21) {
              countComp += Number(card.bjVal11)
            }
          }

          cScore.innerHTML = countComp;

          if (countComp > 21) {
            compGamestageMsg.innerHTML = "BUST";
          } else if (countComp === 21) {
            compGamestageMsg.innerHTML = "WIN";
          }
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

  function pressStand() {
    let playerBtns = document.querySelectorAll(".pbtns");

    stand.onclick = function () {
      playerBtns.forEach(btn => {
        btn.classList.add("unclick");
        btn.onclick = null;
      })

      showSecondCard();
    }
  }
  pressStand()

  function showSecondCard() {
    let compSecondCard = compContainer.children[1];
    let secondCardImage = compHand[1].image;

    compSecondCard.innerHTML = '';
    compSecondCard.innerHTML += `<img src=${secondCardImage} alt="">`

    compScore += compHand[1].bjVal;
  }

}
init()
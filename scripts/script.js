let start = document.querySelector("#start");
let hit = document.querySelector("#hit");
let stand = document.querySelector("#stand");
let split = document.querySelector("#split");
let doubleDown = document.querySelector("#DD");
let newBet = document.querySelector("#new-bet");


let BH = document.querySelector(".player-cards");
let playZone = document.querySelector(".play-zone");
let cardsContainer = document.querySelector(".cards-container");

let deckID;
let gameStatus = false;
let gameState;
let cardDist = 0;
playerDist = 0;

let playerCredits = 100000;

const playerHand = [];
const compHand = [];

window.onload = () => {
  displayCredits();
};

start.onclick = async function () {
  try {
    let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
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
        card.bjVal1 = 1;
        card.bjVal11 = 11;
        break
    }

    playerHand.push(card)
    countPlayerScore()

    let cardElem = document.createElement("div");
    cardElem.classList.add("card-face");
    cardElem.innerHTML =
      `
      <img src=${card.image} alt="">
    `;

    cardElem.style.left = playerDist + "px";
    playerDist += 17;


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

    if (compHand.length < 2) {
      let cardElem = document.createElement("div");
      cardElem.classList.add("card-face");
      cardElem.innerHTML =
        `
      <img src=${card.image} alt="">
        `;

      cardElem.style.left = cardDist + "px";
      cardDist += 17;


      compContainer.appendChild(cardElem);
      countPlayerScore()
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

      if (index === 0) {
        fadeIn(cardElem);
      }
    }
  })
}

function countPlayerScore() {
  let pScoreCount = document.querySelector(".pScore");
  let gameStageMsg = document.querySelector(".message");

  let count = 0;

  playerHand.forEach(card => {
    if (!card.value === "ACE") {
      count += Number(card.bjVal);
    } else {
      let result = confirm("OK: 1 | CANCEL: 11");

      if (result) {
        count += Number(card.bjVal1)
      } else {
        count += Number(card.bjVal11)
      }
    }

    pScoreCount.innerHTML = count;

    if (count > 21) {
      gameStageMsg.innerHTML = "BUST";
    } else if (count === 21) {
      gameStageMsg.innerHTML = "WIN";
    }
  })
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

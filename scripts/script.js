let start = document.querySelector("#start");
let hit = document.querySelector("#hit");
let BH = document.querySelector(".player-cards");
let playZone = document.querySelector(".play-zone");
let cardsContainer = document.querySelector(".cards-container");

let deckID;
let HP = 0;

let playerCredits = 100000;

const playerHand = [];
const compHand = [];

window.onload = () => {
  start.click();
  displayCredits();
};

start.onclick = async function () {
  try {
    let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    let data = await response.json();

    deckID = data.deck_id;

    console.log(data)
  } catch (error) {
    console.log(error);
  }
}

hit.onclick = async function () {
  try {
    let currentDraw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`);
    let currentDrawData = await currentDraw.json();
    let cardsP = currentDrawData.cards;

    cardsP.forEach(card => {
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
    });

    console.log(playerHand);
    printCards(cardsP);
    countPlayerScore();

  } catch (error) {
    console.log(error);
  }

}

function printCards(cardsP) {
  cardsP.forEach(card => {
    let cardElem = document.createElement("div");
    cardElem.classList.add("card-face");
    cardElem.innerHTML =
      `
      <img src=${card.image} alt="">
    `;

    cardElem.style.left = HP + "px";
    HP += 18;


    cardsContainer.appendChild(cardElem);

  })
}

function countPlayerScore() {
  let pScoreCount = document.querySelector(".pScore");
  let gameStageMsg = document.querySelector(".message");

  let count = 0;
  console.log(count)

  playerHand.forEach(card => {

    count += Number(card.bjVal);

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
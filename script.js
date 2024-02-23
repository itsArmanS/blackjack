let btn = document.querySelector(".testBtn");
let draw = document.querySelector(".draw");
let BH = document.querySelector(".bottom-header");

let deckID;

const playerHand = [];

btn.onclick = async function () {
    try {
        let response = await fetch("https://www.deckofcardsapi.com/api/deck/new/draw/?count=0")
        let data = await response.json();

        deckID = data.deck_id;

        console.log(data)
    } catch (error) {
        console.log(error);
    }
}

draw.onclick = async function () {
    try {
        if (playerHand.length < 5) {
            let currentDraw = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`);
            let currentDrawData = await currentDraw.json();

            let cardsP = currentDrawData.cards;
            cardsP.forEach(card => playerHand.push(card));

            console.log(playerHand);
            console.log(cardsP);
            printCards(cardsP);
        } else {
            alert("You have the max amount of cards")
        }


    } catch (error) {
        console.log(error);
    }

}

function printCards(cardsP, data) {
    cardsP.forEach(card => {
        BH.innerHTML += `
        <div class=card-face>
            <img src=${card.image} alt="">
        </div>
        `
    })
}
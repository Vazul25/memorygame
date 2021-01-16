function onEasyClicked(event) {
    initializeGame(DIFICULITIES.EASY);
}
function onHardClicked(event) {
    initializeGame(DIFICULITIES.HARD);
}
function onMediumClicked(event) {
    initializeGame(DIFICULITIES.MEDIUM);
}

const DIFICULITIES = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
};
let firstSelectedCard = null;
let secondSelectedCard = null;
let timeoutsByCardId = {};
let foundPairs = 0;
let currentDificulity = null;
let startTime;

function resetSelection() {
    if (firstSelectedCard) {
        firstSelectedCard.selected = false;
        firstSelectedCard = null;
    }
    if (secondSelectedCard) {
        secondSelectedCard.selected = false;
        secondSelectedCard = null;
    }
}

function resetTimeouts() {
    Object.keys(timeoutsByCardId).forEach(key => {
        clearTimeout(timeoutsByCardId[key]);
        delete timeoutsByCardId[key]
    });
}

function generateCardHtmlString(card, dificulity) {
    let col;

    switch (dificulity) {
        case DIFICULITIES.EASY:
            col = "col-sm-3";
            break;
        case DIFICULITIES.MEDIUM:
            col = "col-1-5";
            break;
        case DIFICULITIES.HARD:
            col = "col-sm-1";
            break;
    }

    let cardHtmlString = `
		               <div class="${col} text-center mt-2">
						<div class="card-container" id="cardContainer_${card.id}">
							<div class="card-flip">
								<div class="back">
									<div class="card d-inline-flex justify-content-between ">
										<div class="align-self-start card-number">${card.number}</div>
										<div class="align-self-end card-number">${card.number}</div>
									</div>
								</div>
								<div class="front" id="cardBackground_${card.id}">
									<div class="card card-background"></div>
								</div>
							</div>
						</div>
					</div>
		       `;
    return cardHtmlString;
}


function checkWinCondition() {
    if (foundPairs === getCardPairCountsFromDificulity(currentDificulity)) {
        return true;
    }
    return false;
}

function getCardPairCountsFromDificulity(dificulity) {
    switch (dificulity) {
        case DIFICULITIES.EASY:
            return 8;
        case DIFICULITIES.MEDIUM:
            return 32;
        case DIFICULITIES.HARD:
            return 72;
    }
    error.log("Something awful happened with the dificulity selection");
    return 8;
}

function updateFoundPairsCountInDom(number) {
    document.getElementById("foundPairs").textContent = number;
}

function onCardClickListener(event, card) {
    console.log(timeoutsByCardId);
    if (
        card.selected ||
        card.hidden ||
        Object.keys(timeoutsByCardId).length !== 0
    ) {
        return;
    }

    card.selected = true;

    let selectedCardNode = document.getElementById(`cardContainer_${card.id}`);

    selectedCardNode.classList.add("activated");

    if (firstSelectedCard == null) {
        firstSelectedCard = card;
    } else {
        secondSelectedCard = card;
        let firstSelectedCardNode = document.getElementById(
            `cardContainer_${firstSelectedCard.id}`
        );

        if (secondSelectedCard.number === firstSelectedCard.number) {

            firstSelectedCardNode.classList.add("fade-out");
            selectedCardNode.classList.add("fade-out");
            firstSelectedCard.hidden = true;
            secondSelectedCard.hidden = true;
            resetSelection();
            foundPairs++;
            updateFoundPairsCountInDom(foundPairs);
            if (checkWinCondition()) {
                alert(`Congrats you beat the game in: ${moment((moment().diff(startTime))).utc().format("HH:mm:ss")}`)
            }

        } else {

            // Clicking on two different cards
            function setTimeoutForCardFlip(Node, id) {
                return setTimeout(() => {
                    Node.classList.remove("activated");
                    delete timeoutsByCardId[id];
                }, 1000);
            }
            let firstTimeout = setTimeoutForCardFlip(firstSelectedCardNode, firstSelectedCard.id);
            let secondTimeout = setTimeoutForCardFlip(selectedCardNode, secondSelectedCard.id);
            timeoutsByCardId[firstSelectedCard.id] = firstTimeout;
            timeoutsByCardId[secondSelectedCard.id] = secondTimeout;
            resetSelection();

        }
    }
}

function initializeGame(dificulity) {

    let cards = [];
    foundPairs = 0;
    resetTimeouts();
    resetSelection();
    startTime = moment();
    updateFoundPairsCountInDom(foundPairs);
    currentDificulity = dificulity;
    let cardPairCounts = getCardPairCountsFromDificulity(dificulity);

    for (let i = 1; i <= cardPairCounts; i++) {
        let card1 = { number: i, selected: false, id: `${i}_1`, hidden: false };
        let card2 = { number: i, selected: false, id: `${i}_2`, hidden: false };
        cards.push(card1);
        cards.push(card2);
    }

    cards = _.shuffle(cards);
    var PlayAreaNode = document.getElementById("CardsRoot");
    PlayAreaNode.innerHTML = "";

    cards.forEach((card) => {
        let cardHtmlString = generateCardHtmlString(card, dificulity);
        PlayAreaNode.insertAdjacentHTML("beforeend", cardHtmlString);
        let newNode = document.getElementById(`cardBackground_${card.id}`);
        newNode.addEventListener("click", (event) => {
            onCardClickListener(event, card);
        });
    });
}

let dificulity = DIFICULITIES.EASY;
initializeGame(dificulity);
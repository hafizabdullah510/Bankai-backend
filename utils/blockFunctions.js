import { getContract } from "./contracts.js";
import { ethers } from "ethers";
export const getUserCards = async (user) => {
  const cardContact = await getContract();
  const cardIDs = user.cards.map((card) => card.cardID);
  const cardIDsBytes32 = cardIDs.map((cardID) =>
    ethers.encodeBytes32String(cardID)
  );
  const cardDetails = await cardContact.getAllCardDetails(cardIDsBytes32);

  //from blockchain
  const cards = cardDetails.map((card) => ({
    cardID: card[1],
    cardHolderName: card[2],
    cardNumber: parseInt(card[3]),
    cvv: parseInt(card[4]),
    expiryDate: card[5],
  }));
  //from db
  const userCardsArray = user.cards;

  let combinedArray = cards.map((card1) => {
    let matchedCard = userCardsArray.find(
      (card2) => card2.cardID === card1.cardID
    );
    if (matchedCard) {
      return { ...card1, ...matchedCard };
    } else {
      return card1; // If no matching card found in cardArray2, return cardArray1 entry
    }
  });

  combinedArray.sort((a, b) => {
    // Sort by cardType first
    if (a.cardType === b.cardType) {
      // If cardType is the same, sort by priorityNumber
      return a.priorityNumber - b.priorityNumber;
    } else {
      // Otherwise, credit cards come first
      return a.cardType === "credit" ? -1 : 1;
    }
  });
  return combinedArray;
};

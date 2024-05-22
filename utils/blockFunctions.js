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
    issueDate: card[6],
    cardHolderCnic: card[7],
    cardType: card[8],
    bankName: card[9],
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

export const retreiveSingleCard = async (id, user) => {
  const cardContract = await getContract();
  const card = await cardContract.retrieveCardDetails(id);
  const [
    _,
    cardID,
    cardHolderName,
    cardNumber,
    cvv,
    expiryDate,
    issueDate,
    cardHolderCnic,
    cardType,
    bankName,
  ] = card;
  const cardData = {
    cardID,
    cardHolderName,
    cardNumber: parseInt(cardNumber),
    cvv: parseInt(cvv),
    expiryDate,
    issueDate,
    cardHolderCnic,
    cardType,
    bankName,
  };

  const matchedCard = user.cards.find(
    (card) => card.cardID === cardData.cardID
  );

  if (matchedCard) {
    // Combine properties from both objects
    const combinedCardObject = {
      ...matchedCard,
      cardHolderName: cardData.cardHolderName,
      cardNumber: cardData.cardNumber,
      cvv: cardData.cvv,
      expiryDate: cardData.expiryDate,
      issueDate: cardData.issueDate,
      cardHolderCnic: cardData.cardHolderCnic,
      cardType: cardData.cardType,
      bankName: cardData.bankName,
    };

    return combinedCardObject;
  }
};

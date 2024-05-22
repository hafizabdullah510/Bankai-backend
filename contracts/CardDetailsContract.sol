// Solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract CardDetailsContract {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    struct Card {
        address owner;
        string cardID;
        string cardHolderName;
        string cardNumber;
        string cvv;
        string expiryDate;
        string issueDate;
        string cardHolderCnic;
        string cardType;
        string bankName;
        bool exists;
    }
    
    struct CardParams {
        string cardID;
        string cardNumber;
        string cardHolderName;
        string cvv;
        string expiryDate;
        string issueDate;
        string cardHolderCnic;
        string cardType;
        string bankName;
    }

    mapping(string => Card) private cardDetails;
    
    function storeCardDetails(CardParams memory _params) external onlyOwner returns (Card memory) {
        require(bytes(_params.cardID).length > 0, "Card ID must not be empty.");
        require(!cardDetails[_params.cardID].exists, "Card details already exist for this card ID.");

        cardDetails[_params.cardID] = Card(
            msg.sender,
            _params.cardID,
            _params.cardHolderName,
            _params.cardNumber,
            _params.cvv,
            _params.expiryDate,
            _params.issueDate,
            _params.cardHolderCnic,
            _params.cardType,
            _params.bankName,
            true
        );

        return cardDetails[_params.cardID];
    }

    function deleteCard(string memory _cardID) external onlyOwner returns (bool deleted) {
        require(cardDetails[_cardID].exists, "No card details found for this card ID.");
        delete cardDetails[_cardID];
        return true;
    }

    function retrieveCardDetails(string memory _cardID) external onlyOwner view returns (Card memory) {
        require(cardDetails[_cardID].exists, "No card details found for this card ID.");
        return cardDetails[_cardID];
    }

    // push is not available in memory variables
    function getAllCardDetails(bytes32[] memory cardIDs) external onlyOwner view returns (Card[] memory) {
        // Create a dynamic array to store found cards
        Card[] memory allCards = new Card[](0); // Initialize an empty array
        
        // Iterate through the provided card numbers
        for (uint i = 0; i < cardIDs.length; i++) {
            string memory cardID = bytes32ToString(cardIDs[i]);
            
            // Check if the card exists in the mapping
            if (cardDetails[cardID].exists) {
                // If the card exists, resize the array and add the card to it
                Card[] memory newArray = new Card[](allCards.length + 1);
                for (uint j = 0; j < allCards.length; j++) {
                    newArray[j] = allCards[j];
                }
                newArray[allCards.length] = cardDetails[cardID];
                allCards = newArray;
            }
        }
        
        // Return the dynamic array containing only the found cards
        return allCards;
    }

    // Utility function to convert bytes32 to string
    function bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}
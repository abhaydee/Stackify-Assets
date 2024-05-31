// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./KycStore.sol";
import "./ArwaProperty.sol";

contract ArwaManager {

  address propertyItemAddress;
  address public kycManager;
  address owner;

  constructor(address _kycManager,  address _propertyItemAddress) {
    kycManager = _kycManager;
    owner = msg.sender;
    propertyItemAddress = _propertyItemAddress;
  }

  modifier onlyKyced {
    KycStore _kycManager = KycStore(kycManager);
    require(_kycManager.addressToKycState(msg.sender), "Only Kyced");
    _;
  }

  modifier onlyOwner {
    require(msg.sender == owner, "Only owner");
    _;
  }

  mapping(address => bool) public verifier;

  Property[] public properties;

  enum Status {
    Pending,
    Shipped,
    Accepted,
    Rejected,
    Canceled
  }

  struct Property {
    uint256 id;
    string name;
    string docs;
    string symbol;
    address owner;
    Status status;
    address collectionAddress;
    address verifier;
  }

  function updateVerifier(address verifierAddress, bool state) external onlyOwner {
    verifier[verifierAddress] = state;
  }

  function userProperties(address user) public view returns(Property[] memory) {

    uint256 resultCount;

    for (uint i = 0; i < properties.length; i++) {
      if (properties[i].owner == user) {
        resultCount++;
      }
    }

    if (resultCount == 0) return new Property[](0);

    Property[] memory _properties = new Property[](resultCount);
    uint256 j;

    for(uint i = 0; i < properties.length; i++){
      if(properties[i].owner == user){
        _properties[j] = properties[i];
        j++;
      }
    }
    return _properties;
  }

  function getPropertyById(uint256 id) public view returns(Property memory) {
    return properties[id];
  }

  function updatePropertyState(uint256 propertyId, Status status) external returns(Property memory) {
    Property storage property = properties[propertyId];
    bool isAbleToUpdate = property.verifier == msg.sender || (property.verifier == address(0) && verifier[msg.sender]);
    require(isAbleToUpdate, "Cannot update this property");
    property.status = status;
    if (property.verifier == address(0)) {
      property.verifier = msg.sender;
    }
    return properties[propertyId];
  }

  function createPropertyRequest(string calldata name, string calldata docs, string calldata symbol) external onlyKyced {
    properties.push(Property({
    id: properties.length,
    name: name,
    docs: docs,
    symbol: symbol,
    owner: msg.sender,
    status: Status.Pending,
    collectionAddress: address(0),
    verifier: address(0)
    }));
  }

  function setLibraryAddress(address _propertyItemAddress) public onlyOwner {
    propertyItemAddress = _propertyItemAddress;
  }

  function createPropertyCollection(uint256 propertyId, uint256 priceInWei) public {
    Property storage userProperty = properties[propertyId];

    bool isAbleToUpdate = userProperty.verifier == msg.sender || (userProperty.verifier == address(0) && verifier[msg.sender]);
    require(isAbleToUpdate, "Cannot create property collection!");

    ArwaProperty prop = new ArwaProperty(userProperty.name, userProperty.symbol, userProperty.owner, userProperty.docs, priceInWei);
    address propertyAddress = address(prop);
    userProperty.collectionAddress = propertyAddress;
    userProperty.verifier = msg.sender;
    userProperty.status = Status.Accepted;
  }

  function getAvailableVerifierProperties() external view returns(Property[] memory) {
    require(verifier[msg.sender], "You not a verifier");

    uint256 resultCount;

    for (uint i = 0; i < properties.length; i++) {
      if (properties[i].verifier == msg.sender || properties[i].verifier == address(0)) {
        resultCount++;
      }
    }

    if (resultCount == 0) return new Property[](0);

    Property[] memory _properties = new Property[](resultCount);
    uint256 j;

    for(uint i = 0; i < properties.length; i++){
      if(properties[i].verifier == msg.sender || properties[i].verifier == address(0)){
        _properties[j] = properties[i];
        j++;
      }
    }
    return _properties;
  }

}

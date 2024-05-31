// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract KycStore {

  address owner;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  struct People {
    bool isKycPassed;
    address peopleAddress;
  }

  People[] public people;

  mapping(address => bool) public addressToKycState;

  function setKycStatus(address _peopleAddress, bool _state) external onlyOwner {
    people.push(People(_state, _peopleAddress));
    addressToKycState[_peopleAddress] = _state;
  }
}

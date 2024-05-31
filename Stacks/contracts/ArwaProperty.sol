// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts@4.4.1/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.4.1/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts@4.4.1/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.4.1/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.4.1/access/Ownable.sol";

contract ArwaProperty is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {

  uint256 public maxSupply = 0;
  uint256 public propertryPrice;
  string public docs;

  constructor(string memory name, string memory symbol, address owner, string memory _docs, uint256 price) ERC721(name, symbol) {
    transferOwnership(owner);
    propertryPrice = price;
    docs = _docs;
  }

  function mint(uint256 supply) external onlyOwner {
    maxSupply = supply;
    for (uint256 i = 0; i < supply; i++) {
      safeMint(owner(), i, docs);
    }
  }

  function safeMint(address to, uint256 tokenId, string memory uri)
  internal
  onlyOwner
  {
    require (totalSupply() < maxSupply);
    _safeMint(to, tokenId);
    _setTokenURI(tokenId, uri);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId)
  internal
  override(ERC721, ERC721Enumerable)
  {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function tokenURI(uint256 tokenId)
  public
  view
  override(ERC721, ERC721URIStorage)
  returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
  public
  view
  override(ERC721, ERC721Enumerable)
  returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}

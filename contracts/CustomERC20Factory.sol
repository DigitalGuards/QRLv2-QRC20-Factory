// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CustomERC20.sol";

contract CustomERC20Factory {
    event TokenCreated(address indexed tokenAddress, address indexed owner);

    function createToken(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint8 decimals_,
        uint256 maxSupply_,
        address recipient_,
        address owner_,
        uint256 maxWalletAmount_,
        uint256 maxTxLimit_
    ) external returns (address) {
        CustomERC20 newToken = new CustomERC20(
            name_,
            symbol_,
            initialSupply_,
            decimals_,
            maxSupply_,
            recipient_,
            owner_,
            maxWalletAmount_,
            maxTxLimit_
        );

        emit TokenCreated(address(newToken), owner_);
        return address(newToken);
    }
}

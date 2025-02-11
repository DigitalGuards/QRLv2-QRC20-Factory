// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20.sol";
import "./Ownable.sol";

contract CustomERC20 is ERC20, Ownable {
    uint8 private immutable _decimals;
    uint256 public immutable maxSupply;
    uint256 public maxWalletAmount;
    uint256 public maxTxLimit;

    mapping(address => bool) private _isExcludedFromLimits;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint8 decimals_,
        uint256 maxSupply_,
        address recipient_,
        address owner_,
        uint256 maxWalletAmount_,
        uint256 maxTxLimit_
    ) ERC20(name_, symbol_) Ownable(owner_ != address(0)? owner_ : msg.sender) {
        _decimals = decimals_;
        maxSupply = maxSupply_ > 0 ? maxSupply_ : type(uint256).max; // Default to unlimited if not set
        maxWalletAmount = maxWalletAmount_;
        maxTxLimit = maxTxLimit_;

        address initialRecipient = recipient_ == address(0) ? msg.sender : recipient_;
        _mint(initialRecipient, initialSupply_);

        _isExcludedFromLimits[initialRecipient] = true;
        _isExcludedFromLimits[owner_] = true;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(_checkLimits(msg.sender, recipient, amount), "Transfer exceeds limits");
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_checkLimits(sender, recipient, amount), "Transfer exceeds limits");
        return super.transferFrom(sender, recipient, amount);
    }

    function _checkLimits(address sender, address recipient, uint256 amount) internal view returns (bool) {
        if (_isExcludedFromLimits[sender] || _isExcludedFromLimits[recipient]) {
            return true;
        }
        if (maxTxLimit > 0 && amount > maxTxLimit) {
            return false;
        }
        if (maxWalletAmount > 0 && balanceOf(recipient) + amount > maxWalletAmount) {
            return false;
        }
        return true;
    }
}

contract TokenFactory {
    event TokenCreated(address tokenAddress, string name, string symbol, uint256 initialSupply);

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        uint256 maxSupply,
        address recipient,
        address owner,
        uint256 maxWalletAmount,
        uint256 maxTxLimit
    ) external returns (address) {
        CustomERC20 newToken = new CustomERC20(
            name,
            symbol,
            initialSupply,
            decimals,
            maxSupply,
            recipient,
            owner,
            maxWalletAmount,
            maxTxLimit
        );

        emit TokenCreated(address(newToken), name, symbol, initialSupply);
        return address(newToken);
    }
}

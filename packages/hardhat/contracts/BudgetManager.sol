// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BudgetManager
 * @notice Manages spending limits for users in the Cumulus x402 gateway
 * @dev Tracks cumulative spending and enforces budget limits per user
 */
contract BudgetManager {
    // USDC has 6 decimals, so 0.5 USDC = 500000
    uint256 public constant DEFAULT_BUDGET_LIMIT = 500000; // 0.5 USDC in base units

    // User address => total spent (in USDC base units with 6 decimals)
    mapping(address => uint256) public userSpent;

    // User address => custom budget limit (0 means use default)
    mapping(address => uint256) public userBudgetLimit;

    // Owner can update default limits if needed
    address public owner;

    // Events
    event PaymentRecorded(address indexed user, uint256 amount, uint256 totalSpent);
    event BudgetLimitUpdated(address indexed user, uint256 newLimit);
    event BudgetExceeded(address indexed user, uint256 attempted, uint256 limit, uint256 currentSpent);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Check if a payment would exceed the user's budget
     * @param user The user address
     * @param amount The payment amount in USDC base units (6 decimals)
     * @return allowed Whether the payment is allowed
     * @return remainingBudget How much budget remains
     */
    function checkBudget(address user, uint256 amount) public view returns (bool allowed, uint256 remainingBudget) {
        uint256 limit = getUserBudgetLimit(user);
        uint256 currentSpent = userSpent[user];

        if (currentSpent + amount > limit) {
            return (false, 0);
        }

        remainingBudget = limit - (currentSpent + amount);
        return (true, remainingBudget);
    }

    /**
     * @notice Record a payment and update user's spent amount
     * @dev This should be called by the x402 facilitator or gateway
     * @param user The user making the payment
     * @param amount The payment amount in USDC base units (6 decimals)
     * @return success Whether the payment was recorded successfully
     */
    function recordPayment(address user, uint256 amount) external returns (bool success) {
        (bool allowed, ) = checkBudget(user, amount);

        if (!allowed) {
            emit BudgetExceeded(user, amount, getUserBudgetLimit(user), userSpent[user]);
            revert("Budget limit exceeded");
        }

        userSpent[user] += amount;
        emit PaymentRecorded(user, amount, userSpent[user]);

        return true;
    }

    /**
     * @notice Get the budget limit for a user (custom or default)
     * @param user The user address
     * @return The budget limit in USDC base units
     */
    function getUserBudgetLimit(address user) public view returns (uint256) {
        uint256 customLimit = userBudgetLimit[user];
        return customLimit > 0 ? customLimit : DEFAULT_BUDGET_LIMIT;
    }

    /**
     * @notice Get remaining budget for a user
     * @param user The user address
     * @return remaining The remaining budget in USDC base units
     */
    function getRemainingBudget(address user) public view returns (uint256 remaining) {
        uint256 limit = getUserBudgetLimit(user);
        uint256 spent = userSpent[user];

        if (spent >= limit) {
            return 0;
        }

        return limit - spent;
    }

    /**
     * @notice Set a custom budget limit for a user
     * @dev Only owner can set custom limits
     * @param user The user address
     * @param newLimit The new budget limit (0 to use default)
     */
    function setUserBudgetLimit(address user, uint256 newLimit) external onlyOwner {
        userBudgetLimit[user] = newLimit;
        emit BudgetLimitUpdated(user, newLimit);
    }

    /**
     * @notice Reset a user's spent amount (for testing or admin purposes)
     * @dev Only owner can reset spending
     * @param user The user address
     */
    function resetUserSpending(address user) external onlyOwner {
        userSpent[user] = 0;
        emit PaymentRecorded(user, 0, 0);
    }

    /**
     * @notice Get spending statistics for a user
     * @param user The user address
     * @return spent Total amount spent
     * @return limit Budget limit
     * @return remaining Remaining budget
     * @return utilizationPercent Budget utilization as percentage (0-100)
     */
    function getUserStats(
        address user
    ) external view returns (uint256 spent, uint256 limit, uint256 remaining, uint256 utilizationPercent) {
        spent = userSpent[user];
        limit = getUserBudgetLimit(user);
        remaining = getRemainingBudget(user);

        if (limit > 0) {
            utilizationPercent = (spent * 100) / limit;
        } else {
            utilizationPercent = 0;
        }

        return (spent, limit, remaining, utilizationPercent);
    }

    /**
     * @notice Transfer ownership to a new address
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }
}

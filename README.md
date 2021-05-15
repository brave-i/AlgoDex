#Setup

You can run the program in the frontend directory using 'npm start'
This code is in all the Swap .ts files.

When you run the frontend, it will connect to contracts already deployed, so you shouldn't need to get anything
else going besides a proper connection to the wallet.


# AlgoSwap

## Overview

AlgoSwap is an automated market maker like UniSwap built on the Pure Proof-of-Stake Algorand Blockchain. It relies on the `xy = k` function to maintain exchange rates for liquidity pairs in the market.


## TODO

- Test cases
- Anti-frontrunning using hashed commitments: in one block you must commit to making a trade by putting down a deposit (the amount needs to be thought out to properly align incentives), in a later block you would follow through on the commitment by actually making a trade, you can't make a trade unless you've committed to it in a previous block, this should entirely prevent frontrunning bots

## License

AlgoSwap is made available under the [MIT license](./LICENSE.txt).

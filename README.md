# Transaction Bundler
Have you ever wanted to send two transactions in one? For example, have you ever wanted to call `approve` AND `deposit` in the same transaction? If so, then this repo is for you.

The transaction bundler is a minimalistic smart contract wallet that calls a sequence of compressed transactions in order, so you can save yourself from having to submit two or three or even ten separate transactions, meaning you save ETH on base gas cost of each transaction after the first.

# Warning
No audits, minimally tested. Use at your own risk. Published for entertainment and the hell of it.

# Specification
[Read the specification here!](./docs/Bundler.pdf)

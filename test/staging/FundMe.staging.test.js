const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(" network.name") ? 

describe.skip 
:describe("FundMe", async function () {
        let fundMe
        let deployer
        let sendValue = ethers.utils.parseEther("1")

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContractAt("FundMe", deployer)
    })

    it("allows people to fund and withdraw", async function() {
        await fundMe.fund({ value: sendValue})
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equals(fundMe.balance.toString(), "0")
    })
})

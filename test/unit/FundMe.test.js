const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          console.log("inside describe")

          const sendValue = ethers.utils.parseEther("1") //"1000000000000000000"

          beforeEach(async function () {
              //deploy FundMe contract
              //using Hardhat-deploy

              deployer = (await getNamedAccounts().deployer)
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.priceFeed
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!!"
                  )
              })
              it("Updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.addressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("add funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.funders(0)
                  assert.equal(funder, deployer)
              })
              describe("withdraw", async function () {
                  beforeEach(async function () {
                      await fundMe.fund({ value: sendValue })
                  })
                  it("withdraw ETH from a single founder", async function () {
                      const startingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const startingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)
                      //Act
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )

                      const { gasUsed, effectiveGasPrice } = transactionReceipt
                      const gasCost = gasUsed.mul(effectiveGasPrice)

                      const endingFundMeBalance =
                          await fundMe.provider.getBalance(fundMe.address)
                      const endingDeployerBalance =
                          await fundMe.provider.getBalance(deployer)
                      //Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingFundMeBalance
                              .add(startingDeployerBalance)
                              .toString(),
                          endingDeployerBalance.add(gasCost).toString()
                      )
                  })

                  it("allows us to withdraw with multiple funders"),
                      async function () {
                          //Arrange
                          const accounts = await ethers.getSigners()
                          for (let i = 1; i < 6; i++) {
                              fundMeConnectedContracts = await fundMe.connect(
                                  accounts[i]
                              )
                          }
                          await fundMeConnectedContract.fund({
                              value: sendValue,
                          })
                      }

                  

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //Make sure that the funders are reset properly
                  await fundMe.funders(0).to.be.reverted()

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          fundMe.addressToAmountFunded(accounts[i].address),
                          0
                      )
                  }
              })

              it("only allows the owner to withdraw", async function() {
                const accounts = await ethers.getSigners()    
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedAccount.withdraw()).to.be.revertedWith("FundMe__NotOwner")

              })
          })
      })

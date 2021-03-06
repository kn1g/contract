var Smartbox = artifacts.require("./Smartbox.sol");

contract('Smartbox', (accounts) => {
  it("should have the first account as owner", async () => {
    const smartbox = await Smartbox.deployed();
    const owner = await smartbox.owner();
    assert.equal(owner, accounts[0], "the owner of the smartbox is not the first account");
  });

  it("should rent the smart box, set authorized user and emit events, and a second rent should fail.", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    const tx = await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    const result = await smartbox.isUserAuthorized(accounts[1]);
    assert.equal(result, true, "the accounts[1] is not authorized");

    const duration = await smartbox.duration();
    assert.equal(duration.toNumber(), 5, "duration is wrong!");

    assert.equal(tx.logs[0].event, 'Rented', "the event rented is not emitted");
  })

  it("the box can't be rented again if the rent doesn't time out", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    try {
      await smartbox.rent({from: accounts[2], value: web3.toWei(1, "ether")});
      assert.fail('Something is wrong! The smart box can be rented again.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("only the person who rented the box can open the box", async () => {
    const smartbox = await Smartbox.deployed();
    await smartbox.returnBox();

    await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});

    await smartbox.open({from: accounts[1]});

    try {
      await smartbox.open({from: accounts[2]});
      assert.fail('Something is wrong! The smart box can be opened from other people.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  // it("the owner should be able to withdraw the ether", async () => {
  //   const smartbox = await Smartbox.deployed();
  //   await smartbox.returnBox();
  //
  //   const balance_before = web3.eth.getBalance(accounts[0]);
  //
  //   await smartbox.rent({from: accounts[1], value: web3.toWei(0.005, "ether")});
  //
  //   await smartbox.withdraw({from: accounts[0]});
  //
  //   const balance_after = web3.eth.getBalance(accounts[0]);
  //
  //   assert.equal(balance_after.toNumber(), balance_before.toNumber() + web3.toWei(0.005, "ether"), "The owner doesn't get the correct amount of ether");
  // })

  it("only the owner can withdraw the ether", async () => {
    const smartbox = await Smartbox.deployed();

    try {
      await smartbox.withdraw({from: accounts[1]});
      assert.fail('Something is wrong! Other peoples can withdraw the ether.');
    } catch (err) {
      assert.include(err.toString(), 'revert', "error message doesn't contain revert!");
    }
  })

  it("the box should be available again after the rent times out", async () => {

  })

});

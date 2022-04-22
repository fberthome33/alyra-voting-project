// erc20.test.js 
const {
  BN,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');
const {
  expect
} = require('chai');
const Voting = artifacts.require('Voting');
contract('Voting', function (accounts) {
  const _decimals = new BN(18);
  const owner = accounts[0];
  const voter_1 = accounts[1];
  const voter_2 = accounts[2];
  const voter_3 = accounts[3];
  const voter_4 = accounts[4];
  const voter_5 = accounts[5];

  describe("addVoter Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({from: owner});
    });
    it('addVoter is only callable by owner', async function () {
      await expectRevert(this.VotingInstance.addVoter(voter_1, {from: voter_1
      }), "Ownable: caller is not the owner");
    });

    it('addVoter should be run even if WorkflowStatus is RegisteringVoters', async function () {
      await this.VotingInstance.startProposalsRegistering({
        from: owner
      });
      await expectRevert(this.VotingInstance.addVoter(voter_1, {
        from: owner
      }), "Voters registration is not open yet");
    });

    it('addVoter should not have already registered address', async function () {
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      await expectRevert(this.VotingInstance.addVoter(voter_1, {
        from: owner
      }), "Already registered");
    });

    it('addVoter should add voter', async function () {
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      const addedVoter = await this.VotingInstance.getVoter(voter_1, {
        from: voter_1
      });
      expect(addedVoter).to.have.property('isRegistered').to.be.true;
    });

    it('addVoter should emit VoterRegistered event', async function () {
      expectEvent(await this.VotingInstance.addVoter(voter_1, {
        from: owner
      }), "VoterRegistered", {
        voterAddress: voter_1
      });
    });
  });

  describe("getVoter Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({
        from: owner
      });
    });
    it('getVoter should return added voter', async function () {
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      const addedVoter = await this.VotingInstance.getVoter(voter_1, {
        from: voter_1
      });
      expect(addedVoter).to.have.property('isRegistered').to.be.true;
    });

    it('getVoter should return unregistred with unknow address', async function () {
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      const addedVoter = await this.VotingInstance.getVoter(voter_2, {
        from: voter_1
      });
      expect(addedVoter).to.have.property('isRegistered').to.be.false;
    });

    it('getVoter is only callable by a registered address', async function () {
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      const addedVoter = this.VotingInstance.getVoter(voter_1, {
        from: voter_2
      });
      await expectRevert(addedVoter, "You're not a voter");
    });
  });

  describe("addProposal Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({
        from: owner
      });
    
      await this.VotingInstance.addVoter(voter_1, {
        from: owner
      });
      await this.VotingInstance.addVoter(voter_2, {
        from: owner
      });
      await this.VotingInstance.startProposalsRegistering({
        from: owner
      });
    });

    it('addProposal needs WorkflowStatus ProposalsRegistrationStarted', async function () {
      const currrentWorkflowStatus = await this.VotingInstance.workflowStatus.call({
        from: owner
      });
      expect(new BN(currrentWorkflowStatus)).to.be.bignumber.equal(new BN(Voting.WorkflowStatus.ProposalsRegistrationStarted))
    });

    it('addProposal should revert if WorkflowStatus is not ProposalsRegistrationStarted', async function () {
      await this.VotingInstance.endProposalsRegistering({
        from: owner
      });
      await expectRevert(this.VotingInstance.addProposal('PROPOSAL', {
        from: voter_1
      }), "Proposals are not allowed yet");
    });

    it('addProposal should revert if proposal is empty', async function () {
      await expectRevert(this.VotingInstance.addProposal('', {
        from: voter_1
      }), 'Vous ne pouvez pas ne rien proposer');
    });

    it('addProposal should add one proposal', async function () {
      expectEvent(await this.VotingInstance.addProposal('NEW_PROPOSAL', {
        from: voter_1
      }), 'ProposalRegistered', {
        proposalId: new BN(0)
      });
      const proposalCreated = await this.VotingInstance.getOneProposal(0, {
        from: voter_1
      });
      expect(proposalCreated.description).to.be.equal("NEW_PROPOSAL");
      expect(proposalCreated.voteCount).to.be.bignumber.equal(new BN(0));

      await expectRevert.unspecified(this.VotingInstance.getOneProposal(1, {
        from: voter_1
      }));
    });

    it('addProposal should add two proposal', async function () {
      expectEvent(await this.VotingInstance.addProposal('NEW_PROPOSAL_1', {
        from: voter_1
      }), 'ProposalRegistered', {
        proposalId: new BN(0)
      });
      expectEvent(await this.VotingInstance.addProposal('NEW_PROPOSAL_2', {
        from: voter_2
      }), 'ProposalRegistered', {
        proposalId: new BN(1)
      });
      const proposalCreatedVoter1 = await this.VotingInstance.getOneProposal(0, {
        from: voter_1
      });
      const proposalCreatedVoter2 = await this.VotingInstance.getOneProposal(1, {
        from: voter_1
      });
      expect(proposalCreatedVoter1.description).to.be.equal("NEW_PROPOSAL_1");
      expect(proposalCreatedVoter1.voteCount).to.be.bignumber.equal(new BN(0));
      expect(proposalCreatedVoter2.description).to.be.equal("NEW_PROPOSAL_2");
      expect(proposalCreatedVoter2.voteCount).to.be.bignumber.equal(new BN(0));

      await expectRevert.unspecified(this.VotingInstance.getOneProposal(2, {
        from: voter_1
      }));
    });
  });

  describe("workflowStatus Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.deployed();
    });

    var runs = [{
        method: "startProposalsRegistering",
        expectStatusBefore: Voting.WorkflowStatus.RegisteringVoters,
        expectedStatusBeforeRequireMessage: 'Registering proposals cant be started now',
        expectStatusAfter: Voting.WorkflowStatus.ProposalsRegistrationStarted
      },
      {
        method: "endProposalsRegistering",
        expectStatusBefore: Voting.WorkflowStatus.ProposalsRegistrationStarted,
        expectedStatusBeforeRequireMessage: 'Registering proposals havent started yet',
        expectStatusAfter: Voting.WorkflowStatus.ProposalsRegistrationEnded
      },
      {
        method: "startVotingSession",
        expectStatusBefore: Voting.WorkflowStatus.ProposalsRegistrationEnded,
        expectedStatusBeforeRequireMessage: 'Registering proposals phase is not finished',
        expectStatusAfter: Voting.WorkflowStatus.VotingSessionStarted
      },
      {
        method: "endVotingSession",
        expectStatusBefore: Voting.WorkflowStatus.VotingSessionStarted,
        expectedStatusBeforeRequireMessage: 'Voting session havent started yet',
        expectStatusAfter: Voting.WorkflowStatus.VotingSessionEnded
      },
    ];

    runs.forEach(function (run) {
      it(run.method + 'should only be callable by owner ', async function () {
        await expectRevert(this.VotingInstance[run.method]({
          from: voter_1
        }), "Ownable: caller is not the owner");
      });

      it(run.method + 'should emit event and change status to ' + run.expectStatusAfter, async function () {
        const call = await this.VotingInstance[run.method]({
          from: owner
        });
        const currrentWorkflowStatus = await this.VotingInstance.workflowStatus.call({
          from: owner
        });
        expectEvent(call, 'WorkflowStatusChange', {previousStatus: new BN(run.expectStatusBefore), newStatus: new BN(run.expectStatusAfter)}); 
        expect(new BN(currrentWorkflowStatus)).to.be.bignumber.equal(new BN(run.expectStatusAfter))
      });

      it(+ run.method + 'should revert if current state is not ' + run.expectStatusBefore, async function () {
        await expectRevert(this.VotingInstance[run.method]({
          from: owner
        }), run.expectedStatusBeforeRequireMessage);
      });
    });
  });
  describe("setVote Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({
        from: owner
      });
      await this.VotingInstance.addVoter(voter_1, {from: owner});
      await this.VotingInstance.addVoter(voter_2, {from: owner});
      await this.VotingInstance.startProposalsRegistering({from: owner});
      await this.VotingInstance.addProposal('NEW_PROPOSAL_1', {from: voter_1});
      await this.VotingInstance.endProposalsRegistering({from: owner});
      await this.VotingInstance.startVotingSession({from: owner});
    });

    it('setVote should only callable by a voter', async function () {
      await expectRevert(this.VotingInstance.setVote(0, {from: owner}), "You're not a voter"); 
    });
    it('setVote should not be callable if status is not VotingSessionStarted', async function () {
      await this.VotingInstance.endVotingSession({from: owner});
      await expectRevert(this.VotingInstance.setVote(0, {from: voter_1}), "Voting session havent started yet"); 
    });
    it('setVote should emit event if proposal Index is wrong with index = length', async function () {
      await expectRevert.unspecified(this.VotingInstance.setVote(1, {from: voter_1})); 
    });
    it('setVote should emit event if proposal Index is wrong with index > length', async function () {
      await expectRevert(this.VotingInstance.setVote(2, {from: voter_1}), "Proposal not found"); 
    });

    it('setVote should revert if voter has already voted', async function () {
      await this.VotingInstance.setVote(new BN(0), {from: voter_1}); 
      await expectRevert(this.VotingInstance.setVote(0, {from: voter_1}), "You have already voted"); 
    });


    it('setVote should set voters array', async function () {
      await this.VotingInstance.setVote(0, {from: voter_1}); 
      const storeVoter = await this.VotingInstance.getVoter(voter_1, {from: voter_1});
      expect(new BN(storeVoter.votedProposalId)).to.be.bignumber.equal(new BN(0));
      expect(storeVoter.hasVoted).to.be.true;
    });
    it('setVote should increment proposal voterCount', async function () {
      await this.VotingInstance.setVote(0, {from: voter_1}); 
      const storeProposal = await this.VotingInstance.getOneProposal(0, {from: voter_1});
      expect(new BN(storeProposal.voteCount)).to.be.bignumber.equal(new BN(1));
    });
    it('setVote should increment proposal voterCount when two voters had voted', async function () {
      await this.VotingInstance.setVote(0, {from: voter_1});
      await this.VotingInstance.setVote(0, {from: voter_2}); 
      const storeProposal = await this.VotingInstance.getOneProposal(0, {from: voter_1});
      expect(new BN(storeProposal.voteCount)).to.be.bignumber.equal(new BN(2));
    });
    it('setVote should emit Voted event', async function () {
      expectEvent(await this.VotingInstance.setVote(0, {from: voter_1}), 'Voted', {voter: voter_1, proposalId: new BN(0)}); 
    });
    
  });
  describe.only("tallyVotes Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({
        from: owner
      });
      for (let i = 1; i <= 5; i++) {
        await this.VotingInstance.addVoter(accounts[i], {from: owner});
      }
      await this.VotingInstance.startProposalsRegistering({from: owner});
      for (let i = 1; i <= 5; i++) {
        await this.VotingInstance.addProposal('NEW_PROPOSAL_'+i, {from: voter_1});
      }
      
      await this.VotingInstance.endProposalsRegistering({from: owner});
      await this.VotingInstance.startVotingSession({from: owner});
      await this.VotingInstance.setVote(1, {from: voter_1});
      await this.VotingInstance.setVote(1, {from: voter_2}); 
      await this.VotingInstance.setVote(3, {from: voter_3}); 
      await this.VotingInstance.setVote(2, {from: voter_4}); 
    });

    it('tallyVotes should only callable by a owner', async function () {
      await this.VotingInstance.endVotingSession({from: owner});
      await expectRevert(this.VotingInstance.tallyVotes({from: voter_1}), "Ownable: caller is not the owner"); 
    });

    it('tallyVotes could be executed twice', async function () {
      await this.VotingInstance.endVotingSession({from: owner});
      await this.VotingInstance.tallyVotes({from: owner});
      await expectRevert(this.VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");     });

    it('tallyVotes should emit WorkflowStatusChange event', async function () {
      await this.VotingInstance.endVotingSession({from: owner});
      expectEvent(await this.VotingInstance.tallyVotes({from: owner}), 'WorkflowStatusChange', {previousStatus: new BN(Voting.WorkflowStatus.VotingSessionEnded), newStatus: new BN(Voting.WorkflowStatus.VotesTallied) }); 
    });

    it('tallyVotes should set winningProposalID to max proposal', async function () {
      await this.VotingInstance.endVotingSession({from: owner});
      await this.VotingInstance.tallyVotes({from: owner});
      const winningProposalID = await this.VotingInstance.winningProposalID.call({from: owner});
      expect(new BN(winningProposalID)).to.be.bignumber.equal(new BN(1));
    });

    it('tallyVotes should set winningProposalID to first max proposal in equality case', async function () {
      await this.VotingInstance.setVote(3, {from: voter_5}); 
      await this.VotingInstance.endVotingSession({from: owner});

      await this.VotingInstance.tallyVotes({from: owner});
      const winningProposalID = await this.VotingInstance.winningProposalID.call({from: owner});
      expect(new BN(winningProposalID)).to.be.bignumber.equal(new BN(1));
    });

    it('tallyVotesShunk should set winningProposalID to first max proposal in equality case', async function () {
      await this.VotingInstance.setVote(3, {from: voter_5}); 
      await this.VotingInstance.endVotingSession({from: owner});

      await this.VotingInstance.tallyVotesShunk(1, {from: owner});
      await this.VotingInstance.tallyVotesShunk(1, {from: owner});
      await this.VotingInstance.tallyVotesShunk(1, {from: owner});
      await this.VotingInstance.tallyVotesShunk(1, {from: owner});
      await this.VotingInstance.tallyVotesShunk(1, {from: owner});
      const winningProposalID = await this.VotingInstance.winningProposalID.call({from: owner});
      expect(new BN(winningProposalID)).to.be.bignumber.equal(new BN(1));
    });
  });
  describe("getOneProposal Test Cases", () => {
    beforeEach(async function () {
      this.VotingInstance = await Voting.new({
        from: owner
      });
      for (let i = 1; i <= 5; i++) {
        await this.VotingInstance.addVoter(accounts[i], {from: owner});
      }
      await this.VotingInstance.startProposalsRegistering({from: owner});
      for (let i = 1; i <= 5; i++) {
        await this.VotingInstance.addProposal('NEW_PROPOSAL_'+i, {from: voter_1});
      }
      
      await this.VotingInstance.endProposalsRegistering({from: owner});
      await this.VotingInstance.startVotingSession({from: owner});
      await this.VotingInstance.setVote(1, {from: voter_1});
      await this.VotingInstance.setVote(1, {from: voter_2}); 
      await this.VotingInstance.setVote(3, {from: voter_3}); 
      await this.VotingInstance.setVote(2, {from: voter_4}); 
      await this.VotingInstance.setVote(3, {from: voter_5}); 
      await this.VotingInstance.endVotingSession({from: owner});
    });
    it('getOneProposal should be callable only by voter ', async function () {
      await expectRevert(this.VotingInstance.getOneProposal(0, {from: owner}), "You're not a voter");
    });

    it('getOneProposal should return the number of vote ', async function () {
      const vote_0 = await this.VotingInstance.getOneProposal(0, {from: voter_1});
      const vote_1 = await this.VotingInstance.getOneProposal(1, {from: voter_1});
      const vote_2 = await this.VotingInstance.getOneProposal(2, {from: voter_1});
      const vote_3 = await this.VotingInstance.getOneProposal(3, {from: voter_1});
      expect(new BN(vote_0.voteCount)).to.be.bignumber.equal(new BN(0));
      expect(new BN(vote_1.voteCount)).to.be.bignumber.equal(new BN(2));
      expect(new BN(vote_2.voteCount)).to.be.bignumber.equal(new BN(1));
    });

    it('getOneProposal should revert for bad index ', async function () {
      await expectRevert.unspecified(this.VotingInstance.getOneProposal(10, {from: voter_1}));
    });
  });
});

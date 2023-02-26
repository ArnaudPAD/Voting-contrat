const { expect } = require("chai");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const Contract = artifacts.require("Voting");

contract("Voting", (accounts) => {
  const [owner, voter1, voter2, voter3, voter4, voter5] = accounts;

  const WorkflowStatus = {
    RegisteringVoters: new BN("0"),
    ProposalsRegistrationStarted: new BN("1"),
    ProposalsRegistrationEnded: new BN("2"),
    VotingSessionStarted: new BN("3"),
    VotingSessionEnded: new BN("4"),
    VotesTallied: new BN("5"),
  };

  let contract;

  beforeEach(async () => {
    contract = await Contract.deployed({ from: owner });
  });

  describe("addVoter + getVoter", () => {
    it("verifyWorkFlowStatus for registering", async () => {
      const currentStatus = await contract.workflowStatus();
      expect(currentStatus).to.be.bignumber.equal(
        WorkflowStatus.RegisteringVoters
      );
    });

    it("should add a voter", async () => {
      await contract.addVoter(owner, { from: owner });
      await contract.addVoter(voter1, { from: owner });
      await contract.addVoter(voter2, { from: owner });
      await contract.addVoter(voter3, { from: owner });
      await contract.addVoter(voter4, { from: owner });
      await contract.addVoter(voter5, { from: owner });

      let voterObjet1 = await contract.getVoter(voter1);

      // expectEvent(result, "VoterRegistered", { voter: voter1 });
      expect(voterObjet1.isRegistered).to.be.true;
    });

    it("should revert if voter is already registered", async () => {
      await expectRevert(
        contract.addVoter(voter1, { from: owner }),
        "Already registered"
      );
    });
  });

  describe("addProposal", () => {
    it("should revert if proposals registration is not open", async () => {
      await expectRevert(
        contract.addProposal("Proposal 1", { from: voter1 }),
        "Proposals are not allowed yet"
      );
    });

    it("should revert if voters registration is not open", async () => {
      await contract.startProposalsRegistering({ from: owner });
      await expectRevert(
        contract.addVoter(accounts[3], { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("should add a new proposal if proposals registration is open", async () => {
      await contract.addProposal("Proposal 1", { from: voter1 });
      await contract.addProposal("Proposal 2", { from: voter2 });
      const proposal = await contract.getOneProposal(1);

      expect(proposal.description).to.equal("Proposal 1");
    });
  });

  describe("startVotingSession", () => {
    it("should revert if not called by owner", async () => {
      await expectRevert(
        contract.startVotingSession({ from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert if proposals registration is not ended", async () => {
      await expectRevert(
        contract.startVotingSession({ from: owner }),
        "Registering proposals phase is not finished"
      );
    });

    it("should end proposals registration if proposals registration is started", async () => {
      // await contract.WorkflowStatusChange(
      //   WorkflowStatus.ProposalsRegistrationStarted,
      //   WorkflowStatus.ProposalsRegistrationStarted,
      //   { from: owner }
      // );
      await contract.endProposalsRegistering({ from: owner });
      const workflowStatus = await contract.workflowStatus();
      expect(workflowStatus).to.be.bignumber.equal(
        WorkflowStatus.ProposalsRegistrationEnded
      );
    });

    it("should start the voting session if proposals registration is ended", async () => {
      await contract.startVotingSession({ from: owner });
      const result = await contract.workflowStatus();
      expect(result).to.be.bignumber.equal(WorkflowStatus.VotingSessionStarted);
    });
  });

  describe("setVote", () => {
    it("should revert if not called by registered voter", async () => {
      await expectRevert(
        contract.setVote(1, { from: accounts[6] }),
        "You're not a voter"
      );
    });

    it("should revert if voter has already voted", async () => {
      await contract.setVote(1, { from: voter1 });
      await expectRevert(
        contract.setVote(1, { from: voter1 }),
        "You have already voted"
      );
    });

    it("should revert if the proposal id does not exist", async () => {
      await expectRevert(
        contract.setVote(5, { from: voter5 }),
        "Proposal not found"
      );
    });

    it("should set the vote for the given proposal id", async () => {
      await contract.setVote(1, { from: voter4 });
      const vote = await contract.getOneProposal(1);

      expect(vote.voteCount).to.be.bignumber.equal(new BN("2"));
    });
  });



  describe("endVotingSession", () => {

    it("try to tally before ending session",async()=> {
      
        // Essayer d'appeler la fonction avant la fin de la session de vote
        await expectRevert(
          contract.tallyVotes({ from: owner }),
          "Current status is not voting session ended"
        );
      
    })
    it("end the votingSession", async () => {
      await contract.endVotingSession({ from: owner });
      const currentStatus = await contract.workflowStatus();

      expect(currentStatus).to.be.bignumber.equal(
        WorkflowStatus.VotingSessionEnded
      );
    });

    it("should revert if not called by owner", async () => {
      await expectRevert(
        contract.endVotingSession({ from: voter1 }),
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("winningProposal", async () => {


    it("check the winner", async () => {
      await contract.tallyVotes({ from: owner });

      // Vérifier que le gagnant est la proposition 0
      const winningProposalId = await contract.winningProposalID();
      expect(winningProposalId).to.be.bignumber.equal(new BN(1));
    });

    it("Put the enum at tallyVote", async () => {
      const currentStatus = await contract.workflowStatus();

      expect(currentStatus).to.be.bignumber.equal(WorkflowStatus.VotesTallied);
    });

    it("should revert if called by a non-owner account", async () => {
      // Essayer d'appeler la fonction depuis un compte non propriétaire
      await expectRevert(
        contract.tallyVotes({ from: accounts[1] }),
        "Ownable: caller is not the owner"
      );
    });
  });
});

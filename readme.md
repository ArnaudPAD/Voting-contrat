## Description of tests

# The following tests have been conducted on the smart contract:

### addVoter + getVoter

- verifyWorkFlowStatus for registering: This test verifies that the workflowStatus function returns the correct status for the initial registering phase.

* should add a voter: This test adds voters and verifies that they have been added correctly by checking the isRegistered property.

* should revert if voter is already registered: This test ensures that a voter cannot be added twice by checking that the addVoter function reverts when trying to add an already registered voter.

### addProposal

- should revert if proposals registration is not open: This test ensures that it is not possible to add proposals when the registration phase is not open by checking that the addProposal function reverts.

- should revert if voters registration is not open: This test ensures that it is not possible to add voters when the registration phase is not open by checking that the addVoter function reverts.

- should add a new proposal if proposals registration is open: This test adds proposals and checks that they have been added correctly by verifying the description of the proposal.

### startVotingSession

should revert if not called by owner: This test ensures that only the owner can start the voting session by checking that the startVotingSession function reverts when called by a non-owner.

- should revert if proposals registration is not ended: This test ensures that the voting session cannot be started until the proposals registration phase is ended by checking that the startVotingSession function reverts when called before the registration phase has ended.

- should end proposals registration if proposals registration is started: This test ensures that the endProposalsRegistering function updates the workflow status correctly by checking that the workflowStatus returns the correct status after the function is called.

- should start the voting session if proposals registration is ended: This test ensures that the startVotingSession function updates the workflow status correctly by checking that the workflowStatus returns the correct status after the function is called.

### setVote

- should revert if not called by registered voter: This test ensures that only registered voters can set their vote by checking that the setVote function reverts when called by a non-registered voter.

- should revert if voter has already voted: This test ensures that a voter can only vote once by checking that the setVote function reverts when called by a voter who has already voted.

- should revert if the proposal id does not exist: This test ensures that a vote cannot be cast for a non-existent proposal by checking that the setVote function reverts when called with a non-existent proposal id.

- should set the vote for the given proposal id: This test ensures that a vote is recorded correctly by checking that the voteCount property of the proposal is updated correctly.

### endVotingSession

- try to tally before ending session: This test ensures that it is not possible to tally the votes before the end of the voting session by checking that the tallyVotes function reverts when called before the end of the voting session.

# Conclusion

- The smart contract has passed all tests and is functioning as expected.

// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    // A partir d'une address on récupère l'objet vote
    mapping(address => Voter) voter;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);

    // Stockage des enum dans une variable
    WorkflowStatus public workFlowStatus;

    WorkflowStatus status = WorkflowStatus.RegisteringVoters;

    uint256 nonce;

    // Création du tableau des proposals
    Proposal[] public proposals;

    function startRegisteringProposals() external onlyOwner {
        require(
            status != WorkflowStatus.ProposalsRegistrationStarted,
            "Voter registration session has already started."
        );

        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    function endRegisteringProposals() external onlyOwner {
        require(
            status == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposal registration session has not started yet."
        );
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    function whiteListVoter(address _voter) external onlyOwner {
        require(voter[_voter].isRegistered == false, "Allready register");

        voter[_voter].isRegistered = true;
        emit VoterRegistered(_voter);
    }

    function startVotingSession() external onlyOwner {
        require(
            status != WorkflowStatus.VotingSessionStarted,
            "Voting session is allready started"
        );
        status = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    function endVotingSession() external onlyOwner {
        require(
            status == WorkflowStatus.VotingSessionStarted,
            "VotingSession is not started you can't close it"
        );
        status = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    function addProposalIfSubscribe(string memory _proposal) external {
        require(
            status == WorkflowStatus.ProposalsRegistrationStarted,
            "ProposalsRegistration is not open"
        );
        require(
            voter[msg.sender].isRegistered == true,
            "You must be register has a voter if you want to add proposals"
        );

        nonce++;
        uint256 proposalId = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))
        ) % 100;
        proposals.push(Proposal(_proposal, 0));

        emit ProposalRegistered(proposalId);
    }

    function vote(uint256 _proposalId) external {
        require(
            status == WorkflowStatus.VotingSessionStarted,
            "Voting session has not started yet."
        );
        require(voter[msg.sender].isRegistered, "Voter is not registered.");
        require(!voter[msg.sender].hasVoted, "Voter already casted a vote.");
        voter[msg.sender].hasVoted = true;
        voter[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    function getProposals(uint256 _indexProposal)
        external
        view
        returns (string memory)
    {
        require(proposals.length > 0, "No proposals yet");
        require(_indexProposal != 0, " there is no 0 proposals");

        return proposals[_indexProposal - 1].description;
    }

    function getWinner() external onlyOwner returns (string memory) {
        uint256 winnerIndex = 0;
        uint256 maxVotes = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winnerIndex = i;
            }
        }
        status = WorkflowStatus.VotesTallied;
        return proposals[winnerIndex].description;
    }
}

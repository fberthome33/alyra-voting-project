// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import "@openzeppelin/contracts/access/Ownable.sol";

/** 
    @title Voting Contract
    @author Fabien Berthomé
    @notice Allow owner to add voters; voters can add proposal and vote; the owner compute the winner proposal
*/
contract Voting is Ownable {

    // arrays for draw, uint for single
    // uint[] winningProposalsID;
    // Proposal[] public winningProposals;
    uint public winningProposalID;
    uint winningProposalIDTmp;
    uint shunkIndex;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    /**
     * @dev Throws if called by any account other than a registered voter.
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //
    /** 
        getVoter method
        @param _addr the addres of voter
        @return the voter specified by an address
        @dev Throws if caller is not a voter
    */    
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /** 
        getOneProposal method
        @param _proposalIndex index of a proposal
        @return the propasal specified by an _proposalIndex index
        @dev Throws if caller is not a voter
    */
    function getOneProposal(uint _proposalIndex) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_proposalIndex];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 
    /**
        addVoter Method
        @notice add a voter to the registered voters
        @param _addr address of new voter
        @dev Throws if caller is not the contract owner
        @dev Throws if called by an already registered voter
        @dev Throws if workflowStatus is not equals to RegisteringVoters
    */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 
    /* facultatif
     * function deleteVoter(address _addr) external onlyOwner {
     *   require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
     *   require(voters[_addr].isRegistered == true, 'Not registered.');
     *   voters[_addr].isRegistered = false;
     *  emit VoterRegistered(_addr);
    }*/

    // ::::::::::::: PROPOSAL ::::::::::::: // 
    /**
        addProposal Method
        @notice add a new voter proposal to proposals
        @param _desc description of the new proposal - should not be empty
        @dev Throws if caller is not a voter
        @dev Throws if workflowStatus is not equals to ProposalsRegistrationStarted
        @dev Throws if proposal description is empty
    */
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //
    /**
        setVote Method
        @notice set a proposal choice of a voter
        @param _proposalIndex index of a proposal
        @dev Throws if caller is not a voter
        @dev Throws if workflowStatus is not equals to VotingSessionStarted
        @dev Throws if voter has already voted
        @dev Throws if the proposalIndex is not known
    */
    function setVote( uint _proposalIndex) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_proposalIndex < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _proposalIndex;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_proposalIndex].voteCount++;

        emit Voted(msg.sender, _proposalIndex);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /* on pourrait factoriser tout ça: par exemple:
    *
    *  modifier checkWorkflowStatus(uint  _num) {
    *    require (workflowStatus=WorkflowStatus(uint(_num)-1, "bad workflowstatus");
    *    require (num != 5, "il faut lancer tally votes");
    *    _;
    *  }
    *
    *  function setWorkflowStatus(WorkflowStatus _num) public checkWorkflowStatus( _num) onlyOwner {
    *    WorkflowStatus old = workflowStatus;
    *    workflowStatus = WorkflowStatus(_num);
    *    emit WorkflowStatusChange(old, workflowStatus);
    *   } 
    *
    *  ou plus simplement:
    *  function nextWorkflowStatus() onlyOwner{
    *    require (uint(workflowStatus)!=4, "il faut lancer tallyvotes");
    *    WorkflowStatus old = workflowStatus;
    *    workflowStatus= WorkflowStatus(uint (workflowstatus) + 1);
    *    emit WorkflowStatusChange(old, workflowStatus);
    *  }
    *
    */ 

    /**
        startProposalsRegistering Method
        @notice start proposal registering
        @dev Throws if the caller is not the contract owner
        @dev Throws if workflowStatus is not equals to RegisteringVoters
        @dev emit WorkflowStatusChange event
    */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
        endProposalsRegistering Method
        @notice end proposal registering
        @dev Throws if the caller is not the contract owner
        @dev Throws if workflowStatus is not equals to ProposalsRegistrationStarted
        @dev emit WorkflowStatusChange event
    */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
        startVotingSession Method
        @notice start voting session
        @dev Throws if the caller is not the contract owner
        @dev Throws if workflowStatus is not equals to ProposalsRegistrationEnded
        @dev emit WorkflowStatusChange event
    */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
        endVotingSession Method
        @notice end voting session
        @dev Throws if the caller is not the contract owner
        @dev Throws if workflowStatus is not equals to VotingSessionStarted
        @dev emit WorkflowStatusChange event
    */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /* function tallyVotesDraw() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint highestCount;
        uint[5]memory winners; // egalite entre 5 personnes max
        uint nbWinners;
        for (uint i = 0; i < proposalsArray.length; i++) {
            if (proposalsArray[i].voteCount == highestCount) {
                winners[nbWinners]=i;
                nbWinners++;
            }
            if (proposalsArray[i].voteCount > highestCount) {
                delete winners;
                winners[0]= i;
                highestCount = proposalsArray[i].voteCount;
                nbWinners=1;
            }
        }
        for(uint j=0;j<nbWinners;j++){
            winningProposalsID.push(winners[j]);
            winningProposals.push(proposalsArray[winners[j]]);
        }
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    } */


    /**
        tallyVotes Method
        @notice tally votes and set the winning proposal
        @dev Throws if the caller is not the contract owner
        @dev Throws if workflowStatus is not equals to VotingSessionEnded
        @dev emit WorkflowStatusChange - VotesTallied event if methods ends
        @dev tallyVotesShunk 
    */
    function tallyVotes() external onlyOwner {
        uint defaultShunk = 10; 
        innerTallyVotesShunk(defaultShunk) ;
    }
    
    function tallyVotesShunk(uint shunkSize) public onlyOwner {
        innerTallyVotesShunk(shunkSize) ;
    }

    function innerTallyVotesShunk(uint shunkSize) private {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");

       for (uint256 p = shunkIndex; p < proposalsArray.length && p < shunkIndex + shunkSize; p++) {
           if (proposalsArray[p].voteCount > proposalsArray[winningProposalIDTmp].voteCount) {
               winningProposalIDTmp = p;
          }
       }
       shunkIndex += shunkSize;
       if(shunkIndex >= proposalsArray.length ) {
        (winningProposalID, workflowStatus) = (winningProposalIDTmp, WorkflowStatus.VotesTallied);
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
       }
    }
}
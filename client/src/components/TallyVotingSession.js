import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Proposal } from '../Proposal';


function TallyVotingSession ({
  state
}) {
const [stateProposal, setStateProposal] = useState({ listProposal: [], winningProposalID: state.winningProposalID,workflowStatus: state.workflowStatus });


  useEffect(() => {
    (async function () {
      try {
        let options = {
          fromBlock: 0,                  //Number || "earliest" || "pending" || "latest"
          toBlock: 'latest'
        };
        const listProposalEvents = (await state.contract.getPastEvents('ProposalRegistered', options));
        const listProposal = [];
        listProposalEvents.forEach(async(indexProps) => 
        { 
          console.log(indexProps.returnValues.proposalId)
          const proposal =  await state.contract.methods.getOneProposal(Number(indexProps.returnValues.proposalId)).call({ from: state.accounts[0]});
          listProposal.push(new Proposal(Number(indexProps.returnValues.proposalId), proposal.description, proposal.voteCount ));
          setStateProposal(s => ({...s, listProposal: listProposal}))
          console.log(listProposal);
        });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to init TallyVotingSession component.`,
        );
        console.error(error);
      }
    })();
  }, [])


    const tallyVotes = async (e) => {
      e.preventDefault();
      const { accounts, contract } = state;
      //let newProposalDesc = state.proposalId.value;
      await contract.methods.tallyVotes().send({ from: accounts[0] });

      state.winningProposalID = Number(await contract.methods.winningProposalID().call());
      state.workflowStatus  = Number(await contract.methods.workflowStatus().call());
    }

  
        return(
      <><div style={{ display: 'flex', justifyContent: 'center' }}>

            <Card style={{ width: '50rem' }}>
              <Card.Header>
              { state.workflowStatus === 4 &&
                <strong> Vote Not Tallied
                </strong>
              }
              { state.workflowStatus === 5 &&
                <strong> The winner is 
                </strong>
              }
              </Card.Header>
              <Card.Body>
              { state.workflowStatus === 5 && state.voter &&
                <strong>
                  id: {stateProposal.listProposal[stateProposal.winningProposalID]?.id}
                  <br/>
                  description: {stateProposal.listProposal[stateProposal.winningProposalID]?.description}
                  <br/>
                  voteCount: {stateProposal.listProposal[stateProposal.winningProposalID]?.voteCount}
                </strong>
              }
              { state.workflowStatus === 5 && state.accounts && state.accounts[0] && state.accounts[0] === state.owner &&
                <strong>
                  {stateProposal.winningProposalID}
                </strong>
              }
              </Card.Body>
            </Card>
          </div><br></br>
          { state.accounts && state.accounts[0] && state.accounts[0] === state.owner &&
           state.workflowStatus === 4 && 
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Tally Vote</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formProposal">
                    <Form.Control type="text" id="proposal"
                      ref={(input) => { state.proposalId = input; } } />
                  </Form.Group>
                  <Button onClick={this.tallyVotes} variant="dark"> Tally Vote </Button>
                </Card.Body>
              </Card>
            </div>
          }</>
        )
}
export default TallyVotingSession;
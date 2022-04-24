import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { Proposal } from '../Proposal';

function VotingSession ({
    state
}) {
  const [stateProposal, setStateProposal] = useState({ listProposal: []});
  const [setProposalEventValue, setSetProposalEventValue] = useState (0)


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

        state.contract.events.ProposalRegistered()
          .on('data', event => {
            let value = event.returnValues.proposalId;
            console.log(value);

            state.contract.methods.getOneProposal(Number(value)).call({ from: state.accounts[0]}).then((proposal) => {
              const newProps = new Proposal(Number(value), proposal.description, proposal.voteCount )
              setSetProposalEventValue(newProps);
            })
          })

        setStateProposal(s => ({...s, listProposal: listProposal}))
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to init proposal component.`,
        );
        console.error(error);
      }
    })();
  }, [])

  useEffect(()=> {
    console.log(stateProposal);
    const { listProposal } = stateProposal;
    listProposal.push(setProposalEventValue);
    setStateProposal(s => ({...s, listProposal: listProposal}))
  }, [setProposalEventValue])


    const setVote = async (e, index) => {
      e.preventDefault();
      const { accounts, contract } = state;
      //let newProposalDesc = this.props.state.proposalId.value;
      await contract.methods.setVote(Number(index)).send({ from: accounts[0] });
      stateProposal.listProposal[index].voteCount++;
      setStateProposal(s => ({...s, listProposal: stateProposal.listProposal}))
    }

        return(
      <><div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Vote for a proposal</strong></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Description</th>
                          <th>Vote Count</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateProposal.listProposal !== null &&
                          stateProposal.listProposal.map((proposal) => (
                            <tr>
                              <td>{proposal.id}</td>
                              <td>{proposal.description}</td>
                              <td>{proposal.voteCount}</td>
                              <td>
                              { state.voter && !state.voter.hasVoted &&
                                    <Button onClick={(e) => setVote(e, proposal.id)} variant="dark"> Voter </Button>
                              }
                              { state.voter && state.voter.hasVoted && state.voter.votedProposalId == proposal.id &&
                                <span>Vous avez vote pour cette proposition</span>
                              }

                              </td></tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          
</>
        )
    }
    export default VotingSession;
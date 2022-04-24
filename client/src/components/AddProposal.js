import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { Proposal } from '../Proposal';

function AddProposal ({
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


    const addProposal = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = state;
      let newProposalDesc = state.proposal.value;
      await contract.methods.addProposal(newProposalDesc).send({ from: accounts[0] });
    }

        return(
      <><div style={{ display: 'flex', justifyContent: 'center' }}>

            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>List of Proposals</strong></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stateProposal.listProposal !== null &&
                          stateProposal.listProposal.map((proposal) => (
                            <tr><td>{proposal.id}</td><td>{proposal.description}</td></tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div>
          
          { state.voter &&
          <>
          <br></br>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Add a proposal</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formProposal">
                    <Form.Label>Proposal Description</Form.Label>
                    <Form.Control type="text" id="proposal" placeholder="Enter proposal description" 
                      ref={(input) => { state.proposal = input; } } />
                  </Form.Group>
                  <Button onClick={addProposal} variant="dark"> Add </Button>
                </Card.Body>
              </Card>
            </div>
            </>
          }</>
        )
    }
    export default AddProposal;
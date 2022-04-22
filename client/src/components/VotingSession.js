import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

export default class VotingSession extends React.Component {

    constructor(props) {
        super(props);



    }

    setVote = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      let newProposalDesc = this.props.state.proposalId.value;
      await contract.methods.setVote(newProposalDesc).send({ from: accounts[0] });


    }

    setVoteButton = async (e, index) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      //let newProposalDesc = this.props.state.proposalId.value;
      await contract.methods.setVote(Number(index)).send({ from: accounts[0] });


    }

    render(){
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
                        {this.props.state.listProposal !== null &&
                          this.props.state.listProposal.map((proposal) => (
                            <tr><td>{proposal.id}</td><td>{proposal.description}</td><td>{proposal.voteCount}</td><td><Button onClick={(e) => this.setVoteButton(e, proposal.id)} variant="dark"> Voter </Button></td></tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div></>
        )
    }

}
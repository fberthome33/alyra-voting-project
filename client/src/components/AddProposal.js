import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

export default class AddProposal extends React.Component {

    constructor(props) {
        super(props);



    }


    addProposal = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      let newProposalDesc = this.props.state.proposal.value;
      await contract.methods.addProposal(newProposalDesc).send({ from: accounts[0] });




    }

    render(){
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
                        {this.props.state.listProposal !== null &&
                          this.props.state.listProposal.map((proposal) => (
                            <tr><td>{proposal.id}</td><td>{proposal.description}</td></tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div><br></br><div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Add a proposal</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formProposal">
                    <Form.Label>Proposal Description</Form.Label>
                    <Form.Control type="text" id="proposal" placeholder="Enter proposal description" 
                      ref={(input) => { this.props.state.proposal = input; } } />
                  </Form.Group>
                  <Button onClick={this.addProposal} variant="dark"> Add </Button>
                </Card.Body>
              </Card>
            </div></>
        )
    }

}
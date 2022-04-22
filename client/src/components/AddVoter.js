import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

export default class AddVoter extends React.Component {

    constructor(props) {
        super(props);
    }
    addVoter = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      let newAddress = this.props.state.address.value;
      await contract.methods.addVoter(newAddress).send({ from: accounts[0] });
      //listAddress.push(newAddress);
      //setState(s => ({...s, listAddress: listAddress}))
    }


    render(){
        return(
      <><div style={{ display: 'flex', justifyContent: 'center' }}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Add Voter Account</strong></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>@</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.state.listAddress !== null &&
                          this.props.state.listAddress.map((addresse) => (
                            <tr><td>{addresse}</td></tr>
                          ))}
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div><br></br><div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Add a new Voter</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formAddress">
                    <Form.Label>Voter address</Form.Label>
                    <Form.Control type="text" id="address" placeholder="Enter address" 
                      ref={(input) => { this.props.state.address = input; } } />
                  </Form.Group>
                  <Button onClick={this.addVoter} variant="dark"> Autoriser </Button>
                </Card.Body>
              </Card>
            </div></>
        )
    }

}
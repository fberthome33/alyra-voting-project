import React from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

export default class TallyVotingSession extends React.Component {

    constructor(props) {
        super(props);



    }

    setVote = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      let newProposalDesc = this.props.state.proposalId.value;
      await contract.methods.setVote(newProposalDesc).send({ from: accounts[0] });


    }

    tallyVotes = async (e) => {
      e.preventDefault();
      const { accounts, contract, owner, listAddress } = this.props.state;
      //let newProposalDesc = this.props.state.proposalId.value;
      await contract.methods.tallyVotes().send({ from: accounts[0] });
    }

    render(){
        return(
      <><div style={{ display: 'flex', justifyContent: 'center' }}>

            <Card style={{ width: '50rem' }}>
              <Card.Header>
              { this.props.state.workflowStatus === 4 &&
                <strong> Vote Not Tallied
                </strong>
              }
              { this.props.state.workflowStatus === 5 &&
                <strong> The winner is 
                </strong>
              }
              </Card.Header>
              <Card.Body>
              { this.props.state.workflowStatus === 5 && this.props.state.voter &&
                <strong>
                  id: {this.props.state.listProposal[this.props.state.winningProposalID]?.id}
                  <br/>
                  description: {this.props.state.listProposal[this.props.state.winningProposalID]?.description}
                  <br/>
                  voteCount: {this.props.state.listProposal[this.props.state.winningProposalID]?.voteCount}
                </strong>
              }
              { this.props.state.workflowStatus === 5 && this.props.state.accounts && this.props.state.accounts[0] && this.props.state.accounts[0] == this.props.state.owner &&
                <strong>
                  {this.props.state.winningProposalID}
                </strong>
              }
              </Card.Body>
            </Card>
          </div><br></br>
          { this.props.state.workflowStatus === 4 && 
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Card style={{ width: '50rem' }}>
                <Card.Header><strong>Tally Vote</strong></Card.Header>
                <Card.Body>
                  <Form.Group controlId="formProposal">
                    <Form.Control type="text" id="proposal"
                      ref={(input) => { this.props.state.proposalId = input; } } />
                  </Form.Group>
                  <Button onClick={this.tallyVotes} variant="dark"> Tally Vote </Button>
                </Card.Body>
              </Card>
            </div>
          }</>
        )
    }

}
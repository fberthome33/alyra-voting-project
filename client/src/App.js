import React, { useEffect, useState, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Stepper from 'react-stepper-horizontal';
import "./App.css";
import AddVoter from "./components/AddVoter";
import AddProposal from "./components/AddProposal";
import VotingSession from "./components/VotingSession";
import TallyVotingSession from "./components/TallyVotingSession";

function App() {

  var Proposal = function (id, description, voteCount) {
    this.id = id;
    this.description = description;
    this.voteCount = voteCount;
  };

  const steps= [{
    title: 'Add Voter',
    buttonLabel: 'startProposalsRegistering',
    onClick: async(e) => {
      e.preventDefault()
      console.log('onClick', 1)
      goToNextStep(state.contract.methods.startProposalsRegistering());
    }
  }, {
    title: 'Proposals Registering',
    buttonLabel: 'endProposalsRegistering',
    onClick: (e) => {
      e.preventDefault()
      console.log('onClick', 2)
      goToNextStep(state.contract.methods.endProposalsRegistering());
    }
  }, {
    title: 'Proposal is ended',
    buttonLabel: 'startVotingSession',
    onClick: (e) => {
      e.preventDefault()
      console.log('onClick', 3)
      goToNextStep(state.contract.methods.startVotingSession());
    }
  }, {
    title: 'Voting Session',
    buttonLabel: 'endVotingSession',
    onClick: (e) => {
      e.preventDefault()
      console.log('onClick', 4)
      goToNextStep(state.contract.methods.endVotingSession());
    }
    }, {
      title: 'Voting Session Ended',
  }];



  const [state, setState] = useState({ steps: steps, owner: null, workflowStatus: 0, listAddress: [], web3: null, accounts: null, contract: null });
  const inputRef = useRef();
  const [setEventValue, setSetEventValue] = useState (0)
  
  useEffect(() => {
    (async function () {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        setState(s => ({...s, accounts: accounts}))
        console.log(accounts);
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Voting.networks[networkId];
        const instance = new web3.eth.Contract(
          Voting.abi,
          deployedNetwork && deployedNetwork.address,
        );

        let owner = await instance.methods.owner().call();
        
        let voter;
        instance.methods.getVoter(accounts[0]).call({ from: accounts[0]}).then((data) =>
          voter = data);

        const workflowStatus = Number(await instance.methods.workflowStatus().call());
        const winningProposalID = Number(await instance.methods.winningProposalID().call());
        
        let options = {
          fromBlock: 0,                  //Number || "earliest" || "pending" || "latest"
          toBlock: 'latest'
        };
        const listAddress = (await instance.getPastEvents('VoterRegistered', options)).map(voterEvent => voterEvent.returnValues.voterAddress);
        

        const listProposalEvents = (await instance.getPastEvents('ProposalRegistered', options));
        const listProposal = [];
    
    
        listProposalEvents.forEach(async(indexProps) => 
          { 
            console.log(indexProps.returnValues.proposalId)
            const proposal =  await instance.methods.getOneProposal(Number(indexProps.returnValues.proposalId)).call({ from: accounts[0]});
            listProposal.push(new Proposal(Number(indexProps.returnValues.proposalId), proposal.description, proposal.voteCount ));
            setState(s => ({...s, listProposal: listProposal}))
            console.log(listProposal);
          });
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setState({ steps: steps, owner: owner, voter: voter, workflowStatus: workflowStatus, listAddress: listAddress, listProposal: [], web3: web3, accounts: accounts, contract: instance, winningProposalID: winningProposalID });

        instance.events.VoterRegistered()
          .on('data', event => {
            let value = event.returnValues.voterAddress;
            console.log(value);
            //updateVoter(value);
            //setSetEventValue(value);
          })

          instance.events.ProposalRegistered()
          .on('data', event => {
            let value = event.returnValues;
            console.log(value);
            //updateProposals(instance, value);
          })

          .on('changed', changed => console.log(changed))
          // .on('error', err => throw err)
          .on('connected', str => {console.log('connected');
          console.log(str)})
          console.log(state);
         

      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    })();
  }, [])

  useEffect(()=> {
    console.log(state);
    const { listAddress } = state;
    listAddress.push(setEventValue);
    setState(s => ({...s, listAddress: listAddress}))
  }, [setEventValue])


  const updateVoter = (voter) => {

    const { accounts, contract, owner } = state;
    console.log(state);
    //listAddress.push(voter);
    //console.log(listAddress);
    //setState(s => ({...s, listAddress: listAddress}))

  } 

  const goToNextStep = (methodToCall) => {
    methodToCall.send({ from: state.accounts[0] }).then( () => {
    const { accounts, contract, owner, listAddress } = state;
    
    setState(s => ({...s, workflowStatus: state.workflowStatus + 1}));
    });
  }
  
  const buttonStyle = { background: '#E0E0E0', width: 200, padding: 16, textAlign: 'center', margin: '0 auto', marginTop: 32 };


  return (
    <div className="App">
    <div>
        <h2 className="text-center">Système de Voting</h2>
        <hr></hr>
        Account user : {state.accounts && state.accounts[0]}
        { state.accounts && state.accounts[0] && state.accounts[0] == state.owner &&
          <h2>You are the contrat owner</h2>
        }
        { state.voter &&
        <h2>You are the voter</h2>
        }
        <br></br>
    </div>

    <div>
        <Stepper steps={ steps } activeStep={ state.workflowStatus }  />
        <br/>
        {state.workflowStatus  === 0 && (
          <>
            <AddVoter state={state} />
          </>
        )}
        {state.workflowStatus  === 1 && (
          <>
            <AddProposal state={state} />
          </>
        )}
        {state.workflowStatus  === 3 && (
          <>
            <VotingSession state={state} />
          </>
        )}

        {state.workflowStatus >= 4 && (
          <>
            <TallyVotingSession state={state} />
          </>
        )}
        { state.accounts && state.accounts[0] && state.accounts[0] == state.owner && steps[state.workflowStatus]?.onClick && 
        <button type="button" onClick={ steps[state.workflowStatus ].onClick }>{ steps[state.workflowStatus ].buttonLabel}</button>
        }
        </div>
    <br></br>
  </div>
  );
}
export default App;
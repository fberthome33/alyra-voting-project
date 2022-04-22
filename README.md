# Bienvenue sur le Projet - Système de vote 2!

Le but de ce projet est d'ajouter les tests unitaires sur le projet Voting.sol.


# Introduction

Pour ce projet un fichier de tests a été créé : test/voting.test.js. 
Ce fichier est découpé par test de méthode.

## Méthodologie

Les tests testent :
- l'accessibilité  : si la méthode est accessible seulement par le owner du contrat ou un voter.
- les controles de condition (requirer) sont vérifiés
- les events générés sont testés

## Test des WorkflowStatusChange

Pour factoriser le code, le choix de créer un tableau de paramètre a été fait.
| Méthode  Testée | Status Before | Status Message | Status After | 
|----------------|-------------------------------|-----------------|------------|
| startProposalsRegistering | RegisteringVoters | `'Registering proposals cant be started now'` | ProposalsRegistrationStarted | 
| endProposalsRegistering | ProposalsRegistrationStarted | `'Registering proposals havent started yet'` | ProposalsRegistrationEnded | 
| startVotingSession | ProposalsRegistrationEnded | `'Registering proposals phase is not finished'` | VotingSessionStarted | 
| endVotingSession | VotingSessionStarted | `'Voting session havent started yet'` | VotingSessionEnded | 

## Installation
Pour installer le projet, lancer: 
```  
npm install
```

## Lancement des tests
Lancer la commande
```  
truffle test 
```

Pour utiliser Ganache, lancer la commande

```
truffle test --network develop_ganache
```

Le rapport généré par eth-gas-reporter est de la forme:
```
·--------------------------------------------|----------------------------|-------------|----------------------------·
|    Solc version: 0.8.13+commit.abaa5c0e    ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
·············································|····························|·············|·····························
|  Methods                                                                                                           │
···············|·····························|··············|·············|·············|··············|··············
|  Contract    ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
···············|·····························|··············|·············|·············|··············|··············
|  Migrations  ·  setCompleted               ·           -  ·          -  ·      28813  ·           1  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  addProposal                ·       59580  ·      76680  ·      65912  ·          54  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  addVoter                   ·           -  ·          -  ·      50196  ·          79  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  endProposalsRegistering    ·           -  ·          -  ·      30575  ·          20  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  endVotingSession           ·           -  ·          -  ·      30509  ·          13  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  setVote                    ·       41004  ·      78016  ·      68483  ·          46  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  startProposalsRegistering  ·           -  ·          -  ·      47653  ·          26  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  startVotingSession         ·           -  ·          -  ·      30530  ·          19  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Voting      ·  tallyVotes                 ·           -  ·          -  ·      69349  ·           7  ·          -  │
···············|·····························|··············|·············|·············|··············|··············
|  Deployments                               ·                                          ·  % of limit  ·             │
·············································|··············|·············|·············|··············|··············
|  Migrations                                ·           -  ·          -  ·     250154  ·       3.7 %  ·          -  │
·············································|··············|·············|·············|··············|··············
|  Voting                                    ·           -  ·          -  ·    2137466  ·      31.8 %  ·          -  │
·--------------------------------------------|--------------|-------------|-------------|--------------|-------------·
```
## Couverture des tests
Lancer la commande
```  
truffle run coverage
```
Génère un rapport sous la forme
```  
-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
```  
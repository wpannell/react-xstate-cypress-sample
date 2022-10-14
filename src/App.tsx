import React, { useState } from 'react';
import { fetchPeople, fetchPlanets } from './api';
import './App.css';
import List, { SideOfTheForce } from './list/List';
import { matchingMachine } from './machines/matching';
import { useMachine } from '@xstate/react';

export interface Person {
  name: string;
  homeworld: string;
}

function App() {
  const [machine, send] = useMachine(matchingMachine, {
    guards: {
      isCorrect: (ctx, event) =>
        ctx.leftSelectedItem.homeworld === ctx.rightSelectedItem.url
    }
  });

  const [mode, setMode] = useState<SideOfTheForce>(SideOfTheForce.Light);

  return (
    <div className="App">
      {machine.matches('answering.notReadyToSubmit') ? (
        <>
          <List
            fetchData={() => fetchPeople({ maxDelay: 200, errorRate: 0 })}
            selectedItem={machine.context.leftSelectedItem}
            sideOfTheForce={mode}
            onSelection={selectedItem => {
              send({ type: 'selectLeft', selectedItem });
            }}
          ></List>
          <hr></hr>
          <List
            fetchData={() => fetchPlanets({ maxDelay: 200, errorRate: 0 })}
            selectedItem={machine.context.rightSelectedItem}
            sideOfTheForce={mode}
            onSelection={selectedItem => {
              send({ type: 'selectRight', selectedItem });
            }}
          ></List>
          <button
            onClick={() =>
              setMode(
                mode === SideOfTheForce.Light
                  ? SideOfTheForce.Dark
                  : SideOfTheForce.Light
              )
            }
          >
            {mode === SideOfTheForce.Light
              ? 'Come to the Dark'
              : 'Return to the Light'}{' '}
            Side
          </button>
          <button onClick={() => send({ type: 'continue' })}>Continue</button>
        </>
      ) : null}
      {machine.matches('answering.readyToSubmit') ? (
        <>
          <label>Chosen items:</label>
          <p>
            {machine.context.leftSelectedItem &&
              machine.context.leftSelectedItem.name}{' '}
            and
            {machine.context.rightSelectedItem &&
              machine.context.rightSelectedItem.name}
          </p>
          <button onClick={() => send({ type: 'changeAnswers' })}>
            Change Answers
          </button>
          <button onClick={() => send({ type: 'submit' })}>Submit</button>
        </>
      ) : null}
      {machine.matches('submitted') ? (
        <button onClick={() => send({ type: 'reset' })}>Reset</button>
      ) : null}
      {machine.matches('submitted.correct') ? (
        <p>The force is strong with this one.</p>
      ) : null}
      {machine.matches('submitted.incorrect') ? (
        <p>Do, or do not. There is no try.</p>
      ) : null}
    </div>
  );
}

export default App;

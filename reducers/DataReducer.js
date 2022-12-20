import update from 'immutability-helper';

const INITIAL_STATE = {
  IR: [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
  ],
  RD: [
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
  ],
  IRCache: [],
  RDCache: [],
};

const RUNNN = 9;

const DataReducer = (state = INITIAL_STATE, action) => {
  //   console.log(action);
  switch (action.type) {
    case 'ADD_IR':
      if (action.datum.seq === 0) {
        return update(state, {
          IRCache: {
            $set: [
              ...state.IRCache,
              {seq: action.datum.seq, val: action.datum.val},
            ],
          },
        });
      } else if (action.datum.seq !== 23) {
        return update(state, {
          IRCache: {
            $set: [
              ...state.IRCache,
              {seq: action.datum.seq, val: action.datum.val},
            ],
          },
        });
      } else {
        // console.log(state);

        const sumIR = state.IRCache.reduce((acc, curr) => acc + curr.val, 0);
        const avgIR = sumIR / 24;
        // console.log(avgIR);

        let newIR = [...state.IR, avgIR];
        if (newIR.length > RUNNN) {
          newIR = newIR.slice(-RUNNN, -1);
        }
        return update(state, {
          IRCache: {
            $set: [],
          },
          IR: {$set: newIR},
        });
      }
    case 'ADD_RD':
      if (action.datum.seq === 0) {
        return update(state, {
          RDCache: {
            $set: [
              ...state.RDCache,
              {seq: action.datum.seq, val: action.datum.val},
            ],
          },
        });
      } else if (action.datum.seq !== 23) {
        return update(state, {
          RDCache: {
            $set: [
              ...state.RDCache,
              {seq: action.datum.seq, val: action.datum.val},
            ],
          },
        });
      } else {
        const sumRD = state.RDCache.reduce((acc, curr) => acc + curr.val, 0);
        const avgRD = sumRD / 24;
        let newRD = [...state.RD, avgRD];
        if (newRD.length > RUNNN) {
          newRD = newRD.slice(-RUNNN, -1);
        }
        return update(state, {
          RDCache: {
            $set: [],
          },
          RD: {$set: newRD},
        });
      }
    default:
      return state;
  }
};

export default DataReducer;

import { ActionReducer, INIT, UPDATE } from '@ngrx/store';

import { LocalStorageService } from '../local-storage/local-storage.service';
import { AppState } from '../core.state';
// AppState 没有 examples 这个属性, 但也可以获取到值??
export function initStateFromLocalStorage(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return function (state, action) {
    const newState = reducer(state, action);
    if ([INIT.toString(), UPDATE.toString()].includes(action.type)) {
      const loadState = LocalStorageService.loadInitialState();
      return { ...newState, ...loadState };
    }
    return newState;
  };
}

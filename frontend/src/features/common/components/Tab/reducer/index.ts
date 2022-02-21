export type TabState = {
  tabIds: Array<string>;
  panelIds: Array<string>;
  selectedTabIndex: number;
};

export type TabAction =
  | { type: "ADD_TAB_ID"; id: string }
  | { type: "REMOVE_TAB_ID"; id: string }
  | { type: "SELECT_TAB"; id: string }
  | { type: "ADD_PANEL_ID"; id: string }
  | { type: "REMOVE_PANEL_ID"; id: string };

export const tabInitialState: TabState = {
  tabIds: [],
  panelIds: [],
  selectedTabIndex: 0,
};

export function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "ADD_TAB_ID": {
      return { ...state, tabIds: [...state.tabIds, action.id] };
    }
    case "REMOVE_TAB_ID": {
      const idIndex = state.tabIds.findIndex((id) => id === action.id);
      if (idIndex === -1) return { ...state };
      const newIds = state.tabIds.slice();
      newIds.splice(idIndex, 1);
      return { ...state, tabIds: newIds };
    }
    case "ADD_PANEL_ID": {
      return { ...state, panelIds: [...state.panelIds, action.id] };
    }
    case "REMOVE_PANEL_ID": {
      const idIndex = state.panelIds.findIndex((id) => id === action.id);
      if (idIndex === -1) return { ...state };
      const newPanelIds = state.panelIds.slice();
      newPanelIds.splice(idIndex, 1);
      return { ...state, panelIds: newPanelIds };
    }
    case "SELECT_TAB": {
      const selectedTabIndex = state.tabIds.findIndex((id) => id === action.id);
      return { ...state, selectedTabIndex };
    }
  }
}

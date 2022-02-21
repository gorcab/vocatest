export type DisclosureState = {
  panelId: string | null;
  open: boolean;
};

export type DisclosureAction =
  | { type: "REGISTER_PANEL_ID"; id: string }
  | { type: "UNREGISTER_PANEL_ID" }
  | { type: "OPEN_PANEL" }
  | { type: "CLOSE_PANEL" };

export const initialDisclosureState: DisclosureState = {
  panelId: null,
  open: false,
};

export function disclosureReducer(
  state: DisclosureState,
  action: DisclosureAction
): DisclosureState {
  switch (action.type) {
    case "REGISTER_PANEL_ID": {
      return { ...state, panelId: action.id };
    }
    case "UNREGISTER_PANEL_ID": {
      return { ...state, panelId: null };
    }
    case "OPEN_PANEL": {
      return { ...state, open: true };
    }
    case "CLOSE_PANEL": {
      return { ...state, open: false };
    }
  }
}

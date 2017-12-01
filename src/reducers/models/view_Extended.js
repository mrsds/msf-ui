import Immutable from "immutable";
import { viewState } from "_core/reducers/models/view";

export const viewState_Extended = viewState.mergeDeep(
	Immutable.fromJS({
		// mapControlsBoxVisible: true
	})
);

import Immutable from "immutable";
import { asyncState } from "_core/reducers/models/async";

export const asyncState_Extended = asyncState.mergeDeep(
	Immutable.fromJS({
		loadingLayerAvailabilityData: false,
		loadingFeatureFocusInfo: false
	})
);

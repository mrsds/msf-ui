import Immutable from "immutable";
import { asyncState } from "_core/reducers/models/async";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export const asyncState_Extended = asyncState.mergeDeep(
	Immutable.fromJS({
		loadingLayerAvailabilityData: false,
		loadingFeatureFocusInfo: false,
		loadingFeatures: {
			[layerSidebarTypes.CATEGORY_INFRASTRUCTURE]: false,
			[layerSidebarTypes.CATEGORY_PLUMES]: false
		}
	})
);

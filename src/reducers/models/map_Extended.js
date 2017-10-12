import Immutable from "immutable";
import { mapState, layerModel } from "_core/reducers/models/map";

export const mapState_Extended = mapState.mergeDeep(
	Immutable.fromJS({
		groups: [
			{
				id: "VISTA",
				isActive: false,
				title: "Infrastructure",
				opacity: 100,
				displayIndex: 0
			}
		]
	})
);

export const layerModel_Extended = layerModel.mergeDeep(
	Immutable.fromJS({
		group: "",
		visibleInGroup: false,
		layerOrder: null
	})
);

export const groupModel = Immutable.fromJS({
	id: "",
	isActive: false,
	opacity: 100,
	displayIndex: 0,
	title: ""
});

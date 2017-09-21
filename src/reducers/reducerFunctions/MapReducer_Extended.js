import MapReducer from "_core/reducers/reducerFunctions/MapReducer";
import * as appStrings from "_core/constants/appStrings";
import appConfig from "constants/appConfig";
import { layerModel_Extended as layerModel } from "reducers/models/map_Extended";

export default class MapReducer_Extended extends MapReducer {
	static updateAvailableLayers(state, action) {
		return state;
	}

	static ingestLayerConfig(state, action) {
		if (action.options.type === appStrings.LAYER_CONFIG_JSON) {
			let currPartials = state.getIn([
				"layers",
				appStrings.LAYER_GROUP_TYPE_PARTIAL
			]);
			let newPartials = this.generatePartialsListFromJson(action.config);
			return state.setIn(
				["layers", appStrings.LAYER_GROUP_TYPE_PARTIAL],
				currPartials.concat(newPartials)
			);
		} else if (action.options.type === appStrings.LAYER_CONFIG_WMTS_XML) {
			let currPartials = state.getIn([
				"layers",
				appStrings.LAYER_GROUP_TYPE_PARTIAL
			]);
			let newPartials = this.generatePartialsListFromWmtsXml(
				action.config
			);
			return state.setIn(
				["layers", appStrings.LAYER_GROUP_TYPE_PARTIAL],
				currPartials.concat(newPartials)
			);
		} else {
			console.warn(
				"Error in MapReducer.ingestLayerConfig: Could not ingest layer config"
			);
		}
		return state;
	}

	static mergeLayers(state, action) {
		let partials = state.getIn([
			"layers",
			appStrings.LAYER_GROUP_TYPE_PARTIAL
		]);
		let refPartial = null;
		let matchingPartials = null;
		let mergedLayer = null;
		let newLayers = null;
		while (partials.size > 0) {
			// grab a partial
			refPartial = partials.last();
			// remove it from future evaluation
			partials = partials.pop();
			// grab matching partials
			matchingPartials = partials.filter(el => {
				return el.get("id") === refPartial.get("id");
			});
			// remove them from future evaluation
			partials = partials.filter(el => {
				return el.get("id") !== refPartial.get("id");
			});
			// merge the matching partials together
			mergedLayer = matchingPartials.reduce((acc, el) => {
				if (el.get("fromJson")) {
					return acc.mergeDeep(el);
				}
				return el.mergeDeep(acc);
			}, refPartial);
			// merge in the default values
			mergedLayer = layerModel.mergeDeep(mergedLayer);

			// put the newly minted layer into state storage
			if (
				typeof mergedLayer.get("id") !== "undefined" &&
				typeof state.getIn(["layers", mergedLayer.get("type")]) !==
					"undefined"
			) {
				state = state.setIn(
					["layers", mergedLayer.get("type"), mergedLayer.get("id")],
					mergedLayer
				);
			} else {
				console.warn(
					"Error in MapReducer.mergeLayers: could not store merged layer; missing a valid id or type.",
					mergedLayer.toJS()
				);
			}
		}
		return state.removeIn(["layers", appStrings.LAYER_GROUP_TYPE_PARTIAL]); // remove the partials list so that it doesn't intrude later
	}

	static setGroupLayerActive(state, action) {
		const layer = action.layer;
		const newLayer = layer.set("visibleInGroup", action.active);
		return state.setIn(
			["layers", layer.get("type"), layer.get("id")],
			newLayer
		);
	}

	static setGroupActive(state, action) {
		const updatedGroups = state
			.get("groups")
			.map(
				group =>
					group.get("id") === action.group.get("id")
						? group.set("isActive", action.active)
						: group
			);
		return state.set("groups", updatedGroups);
	}
}

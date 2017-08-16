import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";

export default class LayerSidebarReducer {
    static updateActiveCategory(state, action) {
        return state.set("activeCategory", action.category);
    }

    static updateAvailableFeatureList(state, action) {
        const features = action.layerList.reduce((keys, feature) => {
            keys.push(
                Immutable.fromJS({
                    name: feature.properties.name,
                    id: feature.properties.id,
                    category: feature.properties.category,
                    metadata: feature.properties.metadata
                })
            );
            return keys;
        }, []);
        return state
            .setIn(
                [
                    "availableFeatures",
                    layerSidebarTypes.CATEGORY_INFRASTRUCTURE
                ],
                Immutable.fromJS(features)
            )
            .set("pageIndices", state.get("pageIndices").map(index => 0));
    }

    static pageForward(state, action) {
        const currentIndex = state.getIn(["pageIndices", action.category]);
        return state.setIn(
            ["pageIndices", action.category],
            currentIndex + layerSidebarTypes.FEATURES_PER_PAGE
        );
    }

    static pageBackward(state, action) {
        const currentIndex = state.getIn(["pageIndices", action.category]);
        return state.setIn(
            ["pageIndices", action.category],
            currentIndex - layerSidebarTypes.FEATURES_PER_PAGE
        );
    }

    static changeSidebarCategory(state, action) {
        return state.set("activeFeatureCategory", action.category);
    }

    static updateActiveSubcategories(state, action) {
        if (state.get("activeInfrastructureSubCategories").has(action.layer)) {
            return state.setIn(
                ["activeInfrastructureSubCategories", action.layer],
                action.active
            );
        }
    }

    static refreshActiveSubcategories(state, action) {
        const newSubcategoryState = state
            .get("activeInfrastructureSubCategories")
            .map((value, key) => {
                if (action.layerList.get("data").has(key))
                    return action.layerList.getIn(["data", key, "isActive"]);
            });
        return state.set(
            "activeInfrastructureSubCategories",
            newSubcategoryState
        );
    }
}

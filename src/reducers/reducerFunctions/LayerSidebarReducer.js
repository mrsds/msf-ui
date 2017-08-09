import Immutable from 'immutable';
import * as layerSidebarTypes from 'constants/layerSidebarTypes';

export default class LayerSidebarReducer {
    static updateActiveCategory(state, action) {
        return state.set("activeCategory", action.category);
    }

    static updateAvailableFeatureList(state, action) {
        const features = action.layerList.reduce((keys, feature) => {
            const featureName = feature.properties.name;
            if (featureName && /\S/.test(featureName) && keys.every(entry => entry.get("id") !== featureName)) {
                keys.push(Immutable.fromJS({id: featureName, category: feature.properties.category}));
            }
            return keys;
        }, []);
        return state.set("availableFeatures", Immutable.fromJS(features))
            .set("featurePageIndex", Immutable.fromJS({plumes: 0, infrastructure: 0}));
    }

    static pageForward(state, action) {
        let categoryIndex;
        switch (action.category) {
            case 0:
                categoryIndex = "plumes";
                break;
            case 1:
                categoryIndex = "infrastructure";
                break;
        }
        return state.setIn(["featurePageIndex", categoryIndex], state.getIn(["featurePageIndex", categoryIndex]) + layerSidebarTypes.FEATURES_PER_PAGE);
    }

    static pageBackward(state, action) {
        let categoryIndex;
        switch (action.category) {
            case 0:
                categoryIndex = "plumes";
                break;
            case 1:
                categoryIndex = "infrastructure";
                break;
        }
        return state.setIn(["featurePageIndex", categoryIndex], state.getIn(["featurePageIndex", categoryIndex]) - layerSidebarTypes.FEATURES_PER_PAGE);    }

    static changeSidebarCategory(state, action) {
        return state.set("categoryIndex", action.index);
    }
}
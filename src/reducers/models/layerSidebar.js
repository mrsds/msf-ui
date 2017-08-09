import Immutable from 'immutable';
import * as layerSidebarTypes from 'constants/layerSidebarTypes';

export const layerSidebarState = Immutable.fromJS({
    activeCategory: layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
    categoryIndex: 1,
    availableFeatures: [],
    featurePageIndex: {
        plumes: 0,   
        infrastructure: 0,
    },
});

export const featuresModel = Immutable.fromJS({
    id: ""
});
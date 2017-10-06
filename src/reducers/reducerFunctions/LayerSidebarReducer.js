const Fuse = require("fuse.js");
import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appConfig from "constants/appConfig.js";

export default class LayerSidebarReducer {
  static updateActiveCategory(state, action) {
    return state.set("activeCategory", action.category);
  }

  static updateAvailableFeatures(state, action) {
    switch (action.category) {
      case layerSidebarTypes.CATEGORY_INFRASTRUCTURE:
        return state.setIn(
          ["availableFeatures", layerSidebarTypes.CATEGORY_INFRASTRUCTURE],
          Immutable.fromJS(
            !action.featureList
              ? []
              : action.featureList.features.reduce((keys, feature) => {
                  keys.push(
                    Immutable.fromJS({
                      name: feature.properties.name,
                      id: feature.properties.id,
                      category: feature.properties.category,
                      metadata: feature.properties.metadata
                    })
                  );
                  return keys;
                }, [])
          )
        );
      case layerSidebarTypes.CATEGORY_PLUMES:
        return state.setIn(
          ["availableFeatures", layerSidebarTypes.CATEGORY_PLUMES],
          Immutable.fromJS(
            !action.featureList
              ? []
              : action.featureList.reduce((keys, feature) => {
                  console.log(feature);
                  keys.push(
                    Immutable.fromJS({
                      name: feature.name,
                      flight_id: feature.flight_id,
                      id: feature.id,
                      metadata: [
                        {
                          name: "latitude",
                          value: feature.location[0]
                        },
                        {
                          name: "longitude",
                          value: feature.location[1]
                        },
                        {
                          name: "datetime",
                          value: feature.data_date_dt
                        }
                      ],
                      png_url: feature.png_url
                    })
                  );
                  return keys;
                }, [])
          )
        );
      default:
        return state;
    }
  }

  static pageForward(state, action) {
    const currentIndex = state.getIn([
      "searchState",
      action.category,
      "pageIndex"
    ]);
    return state.setIn(
      ["searchState", action.category, "pageIndex"],
      currentIndex + layerSidebarTypes.FEATURES_PER_PAGE
    );
  }

  static pageBackward(state, action) {
    const currentIndex = state.getIn([
      "searchState",
      action.category,
      "pageIndex"
    ]);
    return state.setIn(
      ["searchState", action.category, "pageIndex"],
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
    } else {
      return state;
    }
  }

  static refreshActiveSubcategories(state, action) {
    const newSubcategoryState = state
      .get("activeInfrastructureSubCategories")
      .map((value, key) => {
        if (action.layerList.get("data").has(key))
          return action.layerList.getIn(["data", key, "isActive"]);
      });
    return state.set("activeInfrastructureSubCategories", newSubcategoryState);
  }

  static getSearchResultsHelper(category, featureList, searchString) {
    if (!searchString || !featureList.size) return featureList;
    const searchObject = new Fuse(
      featureList.toJS(),
      appConfig.SEARCH_OPTIONS.get(category).toJS()
    );
    return Immutable.fromJS(searchObject.search(searchString));
  }

  static updateFeatureSearchText(state, action) {
    return state.setIn(
      ["searchState", action.category, "searchString"],
      action.value
    );
  }

  static updateSearchResults(state, action) {
    const searchString = state.getIn([
      "searchState",
      action.category,
      "searchString"
    ]);
    const featureList = state.getIn(["availableFeatures", action.category]);
    const searchResults = LayerSidebarReducer.getSearchResultsHelper(
      action.category,
      featureList,
      searchString
    );
    return state.setIn(
      ["searchState", action.category, "searchResults"],
      searchResults
    );
  }

  static setInfrastructureFacilityFilterOptionsVisible(state, action) {
    const path = [
      "searchState",
      layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
      "facilityFilterOptionsVisible"
    ];
    return state.setIn(path, !state.getIn(path));
  }
}

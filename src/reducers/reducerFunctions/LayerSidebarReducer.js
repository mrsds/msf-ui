import moment from "moment";
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
                                  let ime = feature.metadata.find(x => x.name === "IME20 (kg)");
                                  let imeValue = ime ? parseFloat(ime.value) : null;
                                  keys.push(
                                      Immutable.fromJS({
                                          name: feature.name,
                                          flight_id: feature.flight_id,
                                          id: feature.id,
                                          datetime: feature.data_date_dt,
                                          flight_campaign: feature.airborne_flight_run_number.toString(),
                                          ime: imeValue,
                                          metadata: feature.metadata.concat([
                                              {
                                                  name: "latitude",
                                                  value: feature.location[0]
                                              },
                                              {
                                                  name: "longitude",
                                                  value: feature.location[1]
                                              }
                                          ]),
                                          png_url: feature.png_url,
                                          rgbqlctr_url: feature.rgbqlctr_url
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
        const currentIndex = state.getIn(["searchState", action.category, "pageIndex"]);
        const resultsCount = state.getIn(["searchState", action.category, "searchResults"]).size;
        const newIndex = currentIndex + layerSidebarTypes.FEATURES_PER_PAGE;
        return state.setIn(
            ["searchState", action.category, "pageIndex"],
            newIndex > resultsCount - 1 ? resultsCount : newIndex
        );
    }

    static pageBackward(state, action) {
        const currentIndex = state.getIn(["searchState", action.category, "pageIndex"]);
        const newIndex = currentIndex - layerSidebarTypes.FEATURES_PER_PAGE;
        return state.setIn(
            ["searchState", action.category, "pageIndex"],
            newIndex < 0 ? 0 : newIndex
        );
    }

    static changeSidebarCategory(state, action) {
        return state.set("activeFeatureCategory", action.category);
    }

    static updateActiveSubcategories(state, action) {
        if (state.get("activeInfrastructureSubCategories").has(action.layer)) {
            return state.setIn(["activeInfrastructureSubCategories", action.layer], action.active);
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

    // static setPlumeFilterDateRange(state, action) {
    //     return state.setIn(
    //         ["searchState", layerSidebarTypes.CATEGORY_PLUMES, action.position],
    //         action.date
    //     );
    // }

    static getSearchResultsHelper(category, featureList, searchString) {
        if (!searchString || !featureList.size) return featureList;
        const searchObject = new Fuse(
            featureList.toJS(),
            appConfig.SEARCH_OPTIONS.get(category).toJS()
        );
        return Immutable.fromJS(searchObject.search(searchString));
    }

    // static updateFeatureSearchText(state, action) {
    //     return state.setIn(["searchState", action.category, "searchString"], action.value);
    // }

    static updateSearchResults(state, action) {
        const searchState = state.getIn(["searchState", action.category]);
        let filters = searchState.get("filters");
        const featureList = state.getIn(["availableFeatures", action.category]);
        let searchResults = Immutable.Map();

        if (action.category === layerSidebarTypes.CATEGORY_PLUMES) {
            // Extract search filters
            const startDate = moment.utc(
                filters.getIn([layerSidebarTypes.PLUME_FILTER_PLUME_START_DATE, "selectedValue"])
            );
            const endDate = moment.utc(
                filters.getIn([layerSidebarTypes.PLUME_FILTER_PLUME_END_DATE, "selectedValue"])
            );
            const flightCampaign = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN,
                "selectedValue"
            ]);
            const plumeIME = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_PLUME_IME,
                "selectedValue"
            ]);
            const plumeID = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_PLUME_ID,
                "selectedValue"
            ]);

            // Filter by plumeID via Fuse
            searchResults = LayerSidebarReducer.getSearchResultsHelper(
                action.category,
                featureList,
                plumeID.value
            );

            // Filter by other filters
            searchResults = searchResults.filter(feature => {
                return (
                    moment
                        .utc(feature.get("datetime"))
                        .isBetween(startDate, endDate, "day", "[]") &&
                    (!flightCampaign || feature.get("flight_campaign") === flightCampaign.value) &&
                    (!plumeIME || feature.get("ime") >= plumeIME)
                );
            });

            // Determine selectableValues for each filter
            let flightCampaignSelectableValues = featureList
                .reduce(
                    (acc, feature) =>
                        acc.includes(feature.get("flight_campaign"))
                            ? acc
                            : acc.concat(feature.get("flight_campaign")),
                    []
                )
                .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
                .map(value => {
                    return { value, label: "Campaign " + value };
                });
            filters = filters.setIn(
                [layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN, "selectableValues"],
                flightCampaignSelectableValues
            );

            let plumeIMESelectableValues = [5, 10, 25, 50, 100, 250, 500, 1000, 1500].map(x => {
                return {
                    value: x,
                    label: ">" + x + "kg"
                };
            });

            filters = filters.setIn(
                [layerSidebarTypes.PLUME_FILTER_PLUME_IME, "selectableValues"],
                plumeIMESelectableValues
            );
        } else if (action.category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            // Apply search filters
            // const searchString = searchState.get("searchString");
            searchResults = Immutable.fromJS(featureList);
        }
        const newState = state
            .setIn(["searchState", action.category, "searchResults"], searchResults)
            .setIn(["searchState", action.category, "filters"], filters);

        return this.updatePageIndex(newState, action.category);
    }

    // static setInfrastructureFacilityFilterOptionsVisible(state, action) {
    //     const path = [
    //         "searchState",
    //         layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
    //         "facilityFilterOptionsVisible"
    //     ];
    //     return state.setIn(path, !state.getIn(path));
    // }

    static setPlumeFilter(state, action) {
        return state.setIn(
            [
                "searchState",
                layerSidebarTypes.CATEGORY_PLUMES,
                "filters",
                action.key,
                "selectedValue"
            ],
            action.selectedValue
        );
    }

    // static updateSelectedFlightCampaign(state, action) {
    //     return state.setIn(
    //         ["searchState", layerSidebarTypes.CATEGORY_PLUMES, "selectedFlightCampaign"],
    //         action.flight_campaign
    //     );
    // }

    // static updateSelectedIME(state, action) {
    //     return state.setIn(
    //         ["searchState", layerSidebarTypes.CATEGORY_PLUMES, "selectedIME"],
    //         action.ime
    //     );
    // }

    static selectFeatureInSidebar(state, action) {
        if (!action.shuffleList) return state;
        return this.updatePageIndex(
            state
                .setIn(["activeFeature", "category"], action.category)
                .setIn(["activeFeature", "feature"], action.feature),
            action.category
        );
    }

    static updatePageIndex(state, category) {
        // If no active feature, set the page index to the first page
        const activeFeature = state.getIn(["activeFeature", "feature"]);

        if (!activeFeature) {
            return state.setIn(["searchState", category, "pageIndex"], 0);
        }

        // Get the index of the selected feature in this set of search results.
        const selectedFeatureIndex = state
            .getIn(["searchState", category, "searchResults"])
            .findIndex(feature => feature.get("id") === activeFeature.get("id"));

        return state.setIn(
            ["searchState", category, "pageIndex"],
            selectedFeatureIndex > -1 ? selectedFeatureIndex : 0
        );
    }
}

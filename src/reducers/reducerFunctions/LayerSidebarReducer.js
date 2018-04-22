import moment from "moment";
const Fuse = require("fuse.js");
import Immutable from "immutable";
import * as layerSidebarTypes from "constants/layerSidebarTypes";
import * as appConfig from "constants/appConfig.js";
import MiscUtilExtended from "utils/MiscUtilExtended";

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
                                  // console.log(feature.properties);
                                  let categoryId = feature.properties.category_id;
                                  keys.push(
                                      Immutable.fromJS({
                                          name: feature.properties.name,
                                          id: feature.properties.id,
                                          category: feature.properties.category,
                                          flyoverCount:
                                              feature.properties.num_flights_matching || 0,
                                          plumeCount: feature.properties.num_plumes_matching || 0,
                                          categoryId: categoryId,
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
                            : MiscUtilExtended.processFeatureGeojson(action.featureList)
                    )
                );
            default:
                return state;
        }
    }

    static pageForward(state, action) {
        const currentIndex = state.getIn(["searchState", action.category, "pageIndex"]);
        const resultsCount = state.getIn(["searchState", action.category, "searchResults"]).size;
        let newIndex = currentIndex + 1;
        if (newIndex * layerSidebarTypes.FEATURES_PER_PAGE > resultsCount - 1) {
            newIndex -= 1;
        }

        return state.setIn(["searchState", action.category, "pageIndex"], newIndex);
    }

    static pageBackward(state, action) {
        const currentIndex = state.getIn(["searchState", action.category, "pageIndex"]);
        let newIndex = currentIndex > 1 ? currentIndex - 1 : 0;
        return state.setIn(["searchState", action.category, "pageIndex"], newIndex);
    }

    static setLayerSidebarCollapsed(state, action) {
        return state.set("layerSidebarCollapsed", action.collapsed);
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
                filters.getIn([
                    layerSidebarTypes.PLUME_FILTER_PLUME_START_DATE,
                    "selectedValue",
                    "value"
                ])
            );
            const endDate = moment.utc(
                filters.getIn([
                    layerSidebarTypes.PLUME_FILTER_PLUME_END_DATE,
                    "selectedValue",
                    "value"
                ])
            );
            const flightCampaign = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN,
                "selectedValue",
                "value"
            ]);
            const plumeIME = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_PLUME_IME,
                "selectedValue",
                "value"
            ]);
            const plumeID = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_PLUME_ID,
                "selectedValue",
                "value"
            ]);

            const plumeSortOption = filters.getIn([
                layerSidebarTypes.PLUME_FILTER_SORT_BY,
                "selectedValue",
                "value"
            ]);

            // Filter by plumeID via Fuse
            searchResults = LayerSidebarReducer.getSearchResultsHelper(
                action.category,
                featureList,
                plumeID
            );

            // Filter by other filters
            searchResults = searchResults.filter(feature => {
                return (
                    moment
                        .utc(feature.get("datetime"))
                        .isBetween(startDate, endDate, "day", "[]") &&
                    (!flightCampaign || feature.get("flight_campaign") === flightCampaign) &&
                    (!plumeIME || feature.get("ime") >= plumeIME)
                );
            });

            // Sort list
            let sortFn = sortOption => {
                let sortByDate = (a, b) =>
                    moment.utc(a.get("datetime")).isAfter(moment.utc(b.get("datetime"))) ? -1 : 1;
                let sortByIME = (a, b) => (a.get("ime") > b.get("ime") ? -1 : 1);
                switch (sortOption) {
                    case layerSidebarTypes.PLUME_FILTER_PLUME_OBSERVATION_DATE:
                        return sortByDate;
                    case layerSidebarTypes.PLUME_FILTER_PLUME_IME:
                        return sortByIME;
                    default:
                        return sortByDate;
                }
            };
            searchResults = searchResults.sort(sortFn(plumeSortOption));

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
                    return Immutable.Map({ value, label: "Campaign " + value });
                });
            filters = filters.setIn(
                [layerSidebarTypes.PLUME_FILTER_FLIGHT_CAMPAIGN, "selectableValues"],
                flightCampaignSelectableValues
            );

            let plumeIMESelectableValues = [5, 10, 25, 50, 100, 250, 500, 1000, 1500].map(x => {
                return Immutable.Map({
                    value: x,
                    label: ">" + x + "kg"
                });
            });

            // Set filters to new filters
            filters = filters.setIn(
                [layerSidebarTypes.PLUME_FILTER_PLUME_IME, "selectableValues"],
                plumeIMESelectableValues
            );
        } else if (action.category === layerSidebarTypes.CATEGORY_INFRASTRUCTURE) {
            // Extract search filters
            const infrastructureName = filters.getIn([
                layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME,
                "selectedValue",
                "value"
            ]);

            const infrastructureSortOption = filters.getIn([
                layerSidebarTypes.INFRASTRUCTURE_FILTER_SORT_BY,
                "selectedValue",
                "value"
            ]);

            // Filter by infrastructure name via Fuse
            searchResults = LayerSidebarReducer.getSearchResultsHelper(
                action.category,
                featureList,
                infrastructureName
            );

            // Sort list
            let sortFn = sortOption => {
                let sortByName = (a, b) => (a.get("name") < b.get("name") ? -1 : 1);
                let sortBySubcategory = (a, b) => (a.get("category") < b.get("category") ? -1 : 1);
                let sortByFlyoverCount = (a, b) =>
                    a.get("flyoverCount") > b.get("flyoverCount") ? -1 : 1;
                switch (sortOption) {
                    case layerSidebarTypes.INFRASTRUCTURE_FILTER_NAME:
                        return sortByName;
                    case layerSidebarTypes.INFRASTRUCTURE_FILTER_SUBCATEGORY:
                        return sortBySubcategory;
                    case layerSidebarTypes.INFRASTRUCTURE_FILTER_FLYOVER_COUNT:
                        return sortByFlyoverCount;
                    default:
                        return sortByName;
                }
            };
            searchResults = searchResults.sort(sortFn(infrastructureSortOption));
        }

        return state
            .setIn(["searchState", action.category, "searchResults"], searchResults)
            .setIn(["searchState", action.category, "filters"], filters)
            .setIn(["searchState", action.category, "pageIndex"], 0);
    }

    static setPlumeFilter(state, action) {
        return state.setIn(
            [
                "searchState",
                layerSidebarTypes.CATEGORY_PLUMES,
                "filters",
                action.key,
                "selectedValue"
            ],
            Immutable.fromJS(action.selectedValue)
        );
    }

    static setInfrastructureFilter(state, action) {
        return state.setIn(
            [
                "searchState",
                layerSidebarTypes.CATEGORY_INFRASTRUCTURE,
                "filters",
                action.key,
                "selectedValue"
            ],
            Immutable.fromJS(action.selectedValue)
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
        // if (!action.shuffleList) return state;
        return state
            .setIn(["activeFeature", "category"], action.category)
            .setIn(["activeFeature", "feature"], action.feature);
    }

    static clearFeatureLabels(state, action) {
        return state
            .setIn(["activeFeature", "feature"], null)
            .setIn(["activeFeature", "category"], null);
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

        // Determine the pageIndex using results per page
        let newPageIndex =
            parseInt(Math.ceil((selectedFeatureIndex + 1) / layerSidebarTypes.FEATURES_PER_PAGE)) -
            1;

        return state.setIn(
            ["searchState", category, "pageIndex"],
            newPageIndex > -1 ? newPageIndex : 0
        );
    }
}

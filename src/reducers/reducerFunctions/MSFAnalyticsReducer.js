export default class MSFAnalyticsReducer {
    static changeAnalyticsMode(state, action) {
        return state.set("analyticsMode", action.mode);
    }

    static changeFilterSelectedArea(state, action) {
        return state.setIn(["filterOptions", "selectedArea"], action.areaName);
    }

    static changeFilterSector(state, action) {
        return state
            .setIn(["filterOptions", "selectedSector"], action.sector)
            .setIn(
                ["filterOptions", "selectedSubsector"],
                action.sector !== state.getIn(["filterOptions", "selectedSector"])
                    ? "All"
                    : state.getIn(["filterOptions", "selectedSector"])
            );
    }

    static changeFilterSubsector(state, action) {
        return state.setIn(["filterOptions", "selectedSubsector"], action.subsector);
    }

    static changeFilterUnits(state, action) {
        return state.setIn(["filterOptions", "selectedUnits"], action.units);
    }
}

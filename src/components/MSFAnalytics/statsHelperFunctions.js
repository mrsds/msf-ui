function getFieldSum(subSectors, field, total) {
    const sum = subSectors.reduce((acc, subSector) => {
        return acc + subSector[field];
    }, 0);
    return [sum, total && (sum / total * 100) | 0];
}

function makeSector1Stats(subSectorList, sector) {
    const subSectors = subSectorList[sector];
    const [facilityCount, _] = getFieldSum(subSectors, "facilities");
    const [uniqueFacilityCount, uniqueFacilityPct] = getFieldSum(
        subSectors,
        "unique_facilities_flown_over",
        facilityCount
    );
    const [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct] = getFieldSum(
        subSectors,
        "unique_facilities_with_plume_detections",
        facilityCount
    );
    return {
        sector,
        facilities: facilityCount,
        flyovers: getFieldSum(subSectors, "facility_flyovers")[0],
        uniqueFlownOver: [uniqueFacilityCount, uniqueFacilityPct],
        uniqueWithPlumes: [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct],
        uniqueFacilityCount,
        uniqueFacilityPct,
        uniqueFacilityWithPlumeCount,
        uniqueFacilityWithPlumePct
    };
}

function binSubsectorsBySector1(stats) {
    return stats.reduce((acc, subSector) => {
        const sector = subSector.sector_level_1;
        if (!acc[sector]) {
            acc[sector] = [];
        }
        acc[sector].push(subSector);
        return acc;
    }, {});
}

function makeSubsectorStats(subSector, sectorLevel) {
    const facilityCount = subSector.facilities;
    const uniqueFacilityCount = subSector.unique_facilities_flown_over;
    const uniqueFacilityPct = (uniqueFacilityCount / facilityCount * 100) | 0;
    const uniqueFacilityWithPlumeCount = subSector.unique_facilities_with_plume_detections;
    const uniqueFacilityWithPlumePct = (uniqueFacilityWithPlumeCount / facilityCount * 100) | 0;
    return {
        sector: subSector[`sector_level_${sectorLevel}`],
        facilities: facilityCount,
        flyovers: subSector.facility_flyovers,
        uniqueFlownOver: [uniqueFacilityCount, uniqueFacilityPct],
        uniqueWithPlumes: [uniqueFacilityWithPlumeCount, uniqueFacilityWithPlumePct],
        uniqueFacilityCount,
        uniqueFacilityPct,
        uniqueFacilityWithPlumeCount,
        uniqueFacilityWithPlumePct
    };
}

export function getStatsBySectorLevel(stats, sectorLevel) {
    if (!stats) return [];

    if (sectorLevel === 1) {
        const sectors = binSubsectorsBySector1(stats);
        return Object.keys(sectors).map(key => makeSector1Stats(sectors, key));
    }

    return stats
        .filter(subSector => subSector[`sector_level_${sectorLevel}`])
        .map(subSector => makeSubsectorStats(subSector, sectorLevel));
}

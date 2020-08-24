import Immutable from "immutable";
import * as MSFTypes from "constants/MSFTypes";
import moment from "moment";

/*
            "meta" : {
                "version": "0.1",
                "job_submission_time": jobtime.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "job_owner": jobowner,
                "job_tag": jobtag
            },
            "values": {
                "lon.res": lonres,
                "lat.res": latres,
                "lon.ll": lonll,
                "lat.ll": latll,
                "numpix.x": numpixx,
                "numpix.y": numpixy,
                "numpar": numpar,
                "nhrs": nhrs

            }
        }
 */

export const MSFControlState = Immutable.fromJS({
    controlMode: MSFTypes.CONTROL_MODE_JOB_SUBMISSION,
    jobSubmissionOptions: {
        jobowner: "kgill",
        jobtag: null,
        lonres: 0.05,
        latres: 0.05,
        lonll: -118.5,
        latll: 34.0,
        numpixx: 100,
        numpixy: 100,
        numpar: 300,
        nhrs: 48
    }
});

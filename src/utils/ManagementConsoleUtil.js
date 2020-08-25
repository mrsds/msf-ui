import * as references from "constants/references";
import Immutable from "immutable";
import MiscUtil from "../_core/utils/MiscUtil";
import appConfig from "../constants/appConfig";
import * as appStrings from "../constants/appStrings";

export default class ManagementConsoleUtil {
    static _buildPleiadesJobUrl(params) {
        let url =
            "http://localhost:9090/pleiades/run?jobowner={jobowner}&jobtag={jobtag}&lonres={lonres}&latres={latres}&lonll={lonll}&latll={latll}&numpixx={numpixx}&numpixy={numpixy}&numpar={numpar}&nhrs={nhrs}";

        return url
            .replace("{jobowner}", params.jobowner)
            .replace("{jobtag}", params.jobtag)
            .replace("{lonres}", params.lonres)
            .replace("{latres}", params.latres)
            .replace("{lonll}", params.lonll)
            .replace("{latll}", params.latll)
            .replace("{numpixx}", params.numpixx)
            .replace("{numpixy}", params.numpixy)
            .replace("{numpar}", params.numpar)
            .replace("{nhrs}", params.nhrs);
    }

    static submitPleiadesJob(params) {
        const url = this._buildPleiadesJobUrl(params);
        return MiscUtil.asyncFetch({
            url: url,
            handleAs: appStrings.FILE_TYPE_JSON,
            options: {
                headers: {
                    // send this content-type so browser doesn't send a preflight OPTIONS request
                    // todo: update backend to support OPTIONS request so we don't need this
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        });
    }
}

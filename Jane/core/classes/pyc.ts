import { fetch, request } from "undici";
import { ErrorCode } from "../../types/enums";
import { forceNumberDigits } from "../../utils/utility-functions";
import { JaneGeneralError, JaneHTTPError } from "./errors";

export class PycClient {
    private pyccode: string;
    private password: string;
    private secrets: { token?: string; phpsessid?: string };

    constructor(pyccode: string, password: string) {
        this.pyccode = pyccode;
        this.password = password;
        this.secrets = {};
    }

    async login() {
        if (!this.pyccode || !this.password)
            throw new JaneGeneralError(
                "Insufficient credentials provided",
                ErrorCode.UNEXPECTED_ERR
            );

        const res = await request(
            `https://PYCNextAPI.ookai9097oo.repl.co/creds/${this.pyccode}?pass=${this.password}`
        );

        if (res.statusCode.toString().startsWith("2")) {
            let resjson = await res.body.json();
            this.secrets.phpsessid = resjson.PHPSESSID;
            this.secrets.token = resjson.access_token;
        }
    }

    async getRoomStats(
        date: `${number}/${number}/${number}`,
        floor: string,
        area: string
    ) {
        let [day, month, year] = date.split("/") as `${number}`[];
        day = forceNumberDigits(day, 2) as `${number}`;
        month = forceNumberDigits(month, 2) as `${number}`;
        const res = await fetch(
            `https://PYCNextAPI.ookai9097oo.repl.co/rooms/${year}${month}${day}/${floor}/${area}`,
            {
                method: "GET",
                mode: "cors",
                credentials: "omit",
                headers: {
                    "PYC-PHPSESSID": this.secrets.phpsessid ?? "",
                    "PYC-TOKEN": this.secrets.token ?? "",
                },
            }
        );
        if (res.status.toString().startsWith("2")) {
            const resJson = (await res.json()) as {
                rooms?: string[];
                section_records?: { section: string; records: string[] }[];
            };
            if (!("rooms" in resJson) || !("section_records" in resJson)) {
                throw new JaneGeneralError(
                    "API possibly broken",
                    ErrorCode.UNEXPECTED_ERR
                );
            }
            const roomStats: { [room: string]: { [section: string]: string } } =
                {};
            for (const [index, room] of resJson.rooms?.entries() ??
                [].entries()) {
                const thisRoomRecords: { [section: string]: string } = {};
                for (const { section, records } of resJson.section_records ??
                    []) {
                    thisRoomRecords[section] = records[index];
                }
                roomStats[room] = thisRoomRecords;
            }
            return roomStats;
        } else {
            throw new JaneHTTPError("API responsed with an error", ErrorCode.HTTP_UNEXPECTED_STATUS)
        }
    }
}

import { request } from "undici";
import { JaneGeneralError, JaneHTTPError } from "../core/classes/errors";
import { ErrorCode } from "../types/enums";
import { weatherIcons } from "../data/config/hkostrings.json";

type HkoTimestamp =
    `${string}-${string}-${string}T${number}:${number}:${number}+${number}:${number}`;

function getIconImageUrl(iconId: number) {
    return `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconId}.png`;
}

function getHkoIcon(iconId: number) {
    if (iconId in weatherIcons) {
        const key = iconId.toString() as keyof typeof weatherIcons;
        const iconObj = weatherIcons[key];
        const escapedName = iconObj.emoji.name.replace(/ /g, "_");
        return {
            text: iconObj.text,
            emoji: {
                name: iconObj.emoji.name,
                id: iconObj.emoji.id,
                full: `<:${escapedName}:${iconObj.emoji.id}>`,
            },
        };
    }
    return { text: "", emoji: { name: "", id: "", full: "" } };
}

export enum HkoWarningStatementCode {
    FIRE_DANGER_WARNING = "WFIRE",
    FROST_WARNING = "WFROST",
    HOT_WEATHER_WARNING = "WHOT",
    COLD_WEATHER_WARNING = "WCOLD",
    STRONG_MONSOON_SIGNAL = "WMSGNL",
    RAINSTORM_WARNING_SIGNAL = "WRAIN",
    SPECIAL_ANNOUNCEMENT_ON_FLOODING_IN_THE_NNT = "WFNTSA",
    LANDSLIP_WARNING = "WL",
    TROPICAL_CYCLONE_WARNING_SIGNAL = "WTCSGNL",
    TSUNAMI_WARNING = "WTMW",
    THUNDERSTORM_WARNING = "WTS",
}

type HkoWarningCode =
    | "WFIREY"
    | "WFIRER"
    | "WFROST"
    | "WHOT"
    | "WCOLD"
    | "WMSGNL"
    | "WRAINA"
    | "WRAINR"
    | "WRAINB"
    | "WFNTSA"
    | "WL"
    | "TC1"
    | "TC3"
    | "TC8NE"
    | "TC8SE"
    | "TC8NW"
    | "TC8SW"
    | "TC9"
    | "TC10"
    | "WTMW"
    | "WTS";

type HkoApiWeatherWarningsDataJSON = {
    [propertyCode in HkoWarningStatementCode]?: {
        name: string;
        code: HkoWarningCode;
        type?: string;
        actionCode: string;
        issueTime: HkoTimestamp;
        expireTime?: HkoTimestamp;
        updateTime: HkoTimestamp;
    };
};

interface HkoApiDataJSON {
    lightning?: {
        data: {
            place: string;
            occur: true | "true";
        }[];
    };
    rainfall: {
        data: {
            unit: string;
            place: string;
            max?: number;
            min?: number;
            main: "TRUE" | "FALSE";
        }[];
        startTime: HkoTimestamp;
        endTime: HkoTimestamp;
    };
    icon: number[];
    iconUpdateTime: HkoTimestamp;
    uvindex: {
        data: {
            place: string;
            value: number;
            desc: string;
            message?: string;
        }[];
        recordDesc: string;
    };
    updateTime: HkoTimestamp;
    warningMessage: string;
    rainstormReminder?: string;
    specialWxTips?: string[];
    tcmessage?: string[];
    minTempFrom00To09?: string;
    rainfallFrom00To12?: string;
    rainfallLastMonth?: string;
    rainfallJanuaryToLastMonth?: string;
    temperature: {
        data: {
            place: string;
            value: number;
            unit: string;
        }[];
        recordTime: HkoTimestamp;
    };
    humidity: {
        data: {
            unit: string;
            value: number;
            place: string;
        }[];
        recordTime: HkoTimestamp;
    };
}

export class HkoApiData {
    json: HkoApiDataJSON;
    updated: Date;

    constructor(data: HkoApiDataJSON) {
        this.json = data;
        this.updated = new Date(data.updateTime);
    }

    getTemp(location = "Sha Tin") {
        const data = this.json.temperature.data;
        if (!data.filter((i) => i.place === location).length) {
            location = "Sha Tin";
            if (!data.filter((i) => i.place === location).length) {
                if (data.length) {
                    return data[0];
                }
                throw new JaneGeneralError(
                    "Invalid location",
                    ErrorCode.UNEXPECTED_INPUT_VALUE
                );
            }
        }
        return data.find((i) => i.place === location) as {
            place: string;
            value: number;
            unit: string;
        };
    }

    getRainfall(location = "Sha Tin") {
        const data = this.json.rainfall.data;
        if (!data.filter((i) => i.place === location).length) {
            location = "Sha Tin";
            if (!data.filter((i) => i.place === location).length) {
                if (data.length) {
                    return data[0];
                }
                throw new JaneGeneralError(
                    "Invalid location",
                    ErrorCode.UNEXPECTED_INPUT_VALUE
                );
            }
        }
        return data.find((i) => i.place === location) as {
            unit: string;
            place: string;
            max?: number;
            min?: number;
            main: "TRUE" | "FALSE";
        };
    }

    getWeatherIcons() {
        return this.json.icon.map((i) => ({
            url: getIconImageUrl(i),
            caption: getHkoIcon(i).text,
            id: i,
            emojiStr: getHkoIcon(i).emoji.full,
        }));
    }
}

export async function fetchWeatherData(): Promise<HkoApiData> {
    const res = await request(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread"
    );
    if (res.statusCode.toString().startsWith("2")) {
        return new HkoApiData((await res.body.json()) as HkoApiDataJSON);
    }
    throw new JaneHTTPError(
        "Bad response from HKO API",
        ErrorCode.HTTP_UNEXPECTED_STATUS
    );
}

export async function fetchWeatherWarnings(): Promise<HkoApiWeatherWarningsDataJSON> {
    const res = await request(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc"
    );
    if (res.statusCode.toString().startsWith("2")) {
        return (await res.body.json()) as HkoApiWeatherWarningsDataJSON;
    }
    throw new JaneHTTPError(
        "Bad response from HKO API",
        ErrorCode.HTTP_UNEXPECTED_STATUS
    );
}

import { request } from "undici";
import { JaneGeneralError, JaneHTTPError } from "../core/classes/errors";
import { ErrorCode } from "../types/enums";

type HkoTimestamp =
    `${string}-${string}-${string}T${number}:${number}:${number}+${number}:${number}`;

function getIconImageUrl(iconId: number) {
    return `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconId}.png`;
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

const HkoWeatherIconCaptions = {
    50: "陽光充沛",
    51: "間有陽光",
    52: "短暫陽光",
    53: "間有陽光幾陣驟雨",
    54: "短暫陽光有驟雨	",
    60: "多雲",
    61: "密雲",
    62: "微雨",
    63: "雨",
    64: "大雨",
    65: "雷暴",
    70: "天色良好",
    71: "天色良好",
    72: "天色良好",
    73: "天色良好",
    74: "天色良好",
    75: "天色良好",
    76: "大致多雲",
    77: "天色大致良好",
    80: "大風",
    81: "乾燥",
    82: "潮濕",
    83: "霧",
    84: "薄霧",
    85: "煙霞",
    90: "熱",
    91: "暖",
    92: "涼",
    93: "冷",
};

const HkoWeatherIconEmojiIds = {
    50: "1005798843851472966",
    51: "1005799395918360647",
    52: "1005799397638017034",
    53: "1005799399689027595",
    54: "1005799401601630349",
    60: "1005799403400990830",
    61: "1005799405204537405",
    62: "1005799406873886854",
    63: "1005799408627101776",
    64: "1005799410392891422",
    65: "1005799412414554123",
    70: "1005799413970636820",
    71: "1005799415690301510",
    72: "1005799417548374066",
    73: "1005799419179962378",
    74: "1005799421079982182",
    75: "1005799422682210337",
    76: "1005799425135874079",
    77: "1005799426733903893",
    80: "1005799428780736572",
    81: "1005799430999527485",
    82: "1005799432849199134",
    83: "1005799434501759006",
    84: "1005799436200456192",
    85: "1005799437962055690",
    90: "1005799439945965599",
    91: "1005799441707573269",
    92: "1005799443599200328",
    93: "1005799445910261760",
};

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
            caption:
                HkoWeatherIconCaptions[
                    i as keyof typeof HkoWeatherIconCaptions
                ],
            id: i,
            emojiId:
                HkoWeatherIconEmojiIds[
                    i as keyof typeof HkoWeatherIconEmojiIds
                ],
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

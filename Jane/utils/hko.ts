import { request } from "undici";
import { JaneGeneralError, JaneHTTPError } from "../core/classes/errors";
import { ErrorCode } from "../types/enums";

type HkoTimestamp =
    `${string}-${string}-${string}T${number}:${number}:${number}+${number}:${number}`;

function getIconImageUrl(iconId: number) {
    return `https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconId}.png`;
}

const HkoWeatherIconCaptions = {
    50: "Sunny",
    51: "Sunny Periods",
    52: "Sunny Intervals",
    53: "Sunny Periods with A Few Showers",
    54: "Sunny Intervals with Showers",
    60: "Cloudy",
    61: "Overcast",
    62: "Light Rain",
    63: "Rain",
    64: "Heavy Rain",
    65: "Thunderstorms",
    70: "Fine",
    71: "Fine",
    72: "Fine",
    73: "Fine",
    74: "Fine",
    75: "Fine",
    76: "Mainly Cloudy",
    77: "Mainly Fine",
    80: "Windy",
    81: "Dry",
    82: "Humid",
    83: "Fog",
    84: "Mist",
    85: "Haze",
    90: "Hot",
    91: "Warm",
    92: "Cool",
    93: "Cold",
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

class HkoApiData {
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

    getIcons() {
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

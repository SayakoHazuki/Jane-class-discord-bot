import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { Consts } from "../../core/consts";

import { parse } from "rss-to-json";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";
import { APIEmbedField, RestOrArray } from "discord.js";

const logger: JaneLogger = require("../../core/logger")(__filename);

const commandOptions: CommandOptions = {
    name: "疫情",
    command: "疫情",
    aliases: ["covid", "cov"],
    category: "資訊",
    description: "獲取疫情相關資訊",
    usage: "疫情",
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator
) {
    const reply = await initiator.strictReply("正在獲取相關數據...");
    const news = await fetchNews();
    const embedFields: { [type: string]: APIEmbedField[] } = {
        relatedNews: [],
        possiblyRelatedNews: [],
    };
    for (const newsGroup in news) {
        for (const { title, link, description, time, mediaName } of news[
            <"relatedNews" | "possiblyRelatedNews">newsGroup
        ]) {
            embedFields[<"relatedNews" | "possiblyRelatedNews">newsGroup].push({
                name: `【${mediaName || "?"}】 ${
                    (title?.length >= 28
                        ? title.substring(0, 25) + "..."
                        : title) || "沒有標題"
                }`,
                value: `<t:${time}:R> ${
                    description || "(沒有內容)"
                } [新聞連結](${link || "https://news.google.com"})\n\u2800`,
            });
        }
    }
    const relatedNewsEmbed = new JaneEmbedBuilder(
        "reply",
        "疫情相關新聞",
        "(按更新時間排序)",
        {},
        initiator
    ).setFields(embedFields.relatedNews);
    const possibleRelatedNewsEmbed = new JaneEmbedBuilder(
        "reply",
        "可能相關新聞",
        "(按更新時間排序)",
        {},
        initiator
    ).setFields(embedFields.possiblyRelatedNews);
    const finalEmbeds = [];
    if (embedFields.relatedNews.length) finalEmbeds.push(relatedNewsEmbed);
    if (embedFields.possiblyRelatedNews.length)
        finalEmbeds.push(possibleRelatedNewsEmbed);
    if (!finalEmbeds.length) {
        reply.edit({
            content: "\u2800",
            embeds: [
                new JaneEmbedBuilder(
                    "error",
                    "找不到相關新聞",
                    "請稍候再試一次",
                    {},
                    initiator
                ),
            ],
        });
        return;
    }
    reply.edit({
        content: "\u2800",
        embeds: finalEmbeds,
    });
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};

const medias = [
    {
        mediaName: "香港經濟日報",
        url: "https://www.hket.com/rss/hongkong",
        priority: 50,
    },
    {
        mediaName: "香港電台",
        url: "http://rthk9.rthk.hk/rthk/news/rss/c_expressnews_clocal.xml",
        priority: 80,
    },
    {
        mediaName: "明報",
        url: "https://news.mingpao.com/rss/ins/s00001.xml",
        priority: 100,
    },
    {
        mediaName: "東方日報",
        url: "https://orientaldaily.on.cc/rss/news.xml",
        priority: 30,
    },
    {
        mediaName: "政府新聞網",
        url: "https://www.news.gov.hk/tc/categories/covid19/html/articlelist.rss.xml",
        priority: 80,
    },
];

const accurateRegexFilter =
    /[^。\s\n]*(今|本日)[^。\s\n]*[多增有]([0-9,零一二三四五六七八九十百千萬億]{1,9})[^0-9，。]*(確診|患者|初陽|陽性)([^。\s\n]*)?/;
const lazyRegexFilter =
    /[^\s。][^。]*(多|增|再有|發現)[^。]*(確診|死亡|陽性|初陽|個案|患者|染疫|感染)[^。]*[^\s。]/;

async function fetchNews() {
    let relatedNews: newsSearchResult[] = [];
    let possiblyRelaatedNews: newsSearchResult[] = [];

    for (const { mediaName, url, priority } of medias) {
        let items;
        try {
            ({ items } = await parse(url, {
                headers: { "user-agent": "node.js" },
            }));
        } catch (e) {
            console.log("error");
            continue;
        }
        if (!items) continue;
        const filteredAccurate = items.filter(
            (item) =>
                (accurateRegexFilter.test(item.title) ||
                    accurateRegexFilter.test(item.description)) &&
                (item.published || item.created) >=
                    new Date().getTime() - 86400000
        );
        const filtered = items.filter(
            (item) =>
                (lazyRegexFilter.test(item.title) ||
                    lazyRegexFilter.test(item.description)) &&
                (item.published || item.created) >=
                    new Date().getTime() - 86400000 &&
                !filteredAccurate.map(({ link }) => link).includes(item.link)
        );

        if (filteredAccurate.length) {
            relatedNews = relatedNews.concat(
                filteredAccurate.map(
                    ({
                        title,
                        description,
                        link,
                        published,
                        created,
                    }: {
                        title: string;
                        description: string;
                        link: string;
                        published: number;
                        created: number;
                    }) => ({
                        mediaName,
                        priority,
                        title,
                        link,
                        description:
                            description.match(
                                /[^。\s\n]*(今|本日)[^。\s\n]*[多增有]([0-9,零一二三四五六七八九十百千萬億]{1,9})[^0-9，。]*(個案|確診|患者|初陽|陽性)([^。\s\n]*)?/g
                            )?.[0] ||
                            (description.length >= 60
                                ? description.substring(0, 57) + "..."
                                : description),
                        time: (published || created) / 1000,
                    })
                )
            );
        }

        possiblyRelaatedNews = possiblyRelaatedNews.concat(
            filtered.map(
                ({ title, description, link, published, created }) => ({
                    mediaName,
                    priority,
                    title,
                    link,
                    description:
                        description.match(
                            /[^\s。][^。]*(多|增|再有|發現)[^。]*(確診|死亡|陽性|初陽|個案|患者|染疫|感染)[^。]*[^\s。]/g
                        )?.[0] ||
                        (description.length >= 60
                            ? description.substring(0, 57) + "..."
                            : description),
                    time: (published || created) / 1000,
                })
            )
        );
    }

    return {
        relatedNews: sortNews(relatedNews),
        possiblyRelatedNews: sortNews(possiblyRelaatedNews),
    };

    function sortNews(array: newsSearchResult[]) {
        return array
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3)
            .sort((a, b) => b.time - a.time);
    }
}

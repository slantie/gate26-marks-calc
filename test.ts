import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';

const keysData = {
    DA: JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/da_key.json"), "utf8")),
};

async function testDA() {
    const html = fs.readFileSync(path.join(__dirname, "..", "da_response.html"), "utf8");
    const $ = cheerio.load(html);
    const responses: Record<number, any> = {};

    $(".question-pnl").each((_, pnl) => {
        const qRow = $(pnl).find(".questionRowTbl");
        const menu = $(pnl).find(".menu-tbl");
        if (!qRow.length || !menu.length) return;

        let masterQNum: number | null = null;
        qRow.find("img").each((_, img) => {
            const src = $(img).attr("src") || "";
            if (src.toLowerCase().includes("q") && src.toLowerCase().endsWith(".png")) {
                const filename = src.split("/").pop() || "";
                const match = filename.match(/(?:[a-zA-Z]{2}\d*)q(\d+)q(?:v\d+)?\.png/i);
                if (match && match[1]) {
                    masterQNum = parseInt(match[1]);
                    return false;
                }
            }
        });

        if (masterQNum) {
            responses[masterQNum] = true;
        } else {
            const txts: string[] = [];
            qRow.find("img").each((_, i) => { txts.push($(i).attr("src") as string); });
            console.log("Failed to match:", txts);
        }
    });

    const matchedKeys = Object.keys(responses).map(Number).sort((a, b) => a - b);
    console.log("Extracted Questions:", matchedKeys.length);
    console.log("Missing Questions (1-65):", Array.from({ length: 65 }, (_, i) => i + 1).filter(i => !matchedKeys.includes(i)));
}
testDA();

"use server";

import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

import prisma from "@/lib/prisma";

// Load JSON keys
const keysData: Record<string, any> = {
    CS1: JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/cs1_key.json"), "utf8")),
    CS2: JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/cs2_key.json"), "utf8")),
    DA: JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/da_key.json"), "utf8")),
};

function getMarks(qnum: number) {
    if (qnum >= 1 && qnum <= 5) return 1;
    if (qnum >= 6 && qnum <= 10) return 2;
    if (qnum >= 11 && qnum <= 35) return 1;
    if (qnum >= 36 && qnum <= 65) return 2;
    return 0;
}

function getNegMarks(qnum: number, qtype: string) {
    if (qtype !== "MCQ") return 0;
    const marks = getMarks(qnum);
    if (marks === 1) return 1 / 3;
    if (marks === 2) return 2 / 3;
    return 0;
}

export async function analyzeResponseSheet(url: string, subject: 'CS1' | 'CS2' | 'DA') {
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            redirect: "follow"
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const responses: Record<number, any> = {};
        const answerKey = keysData[subject];

        let candidateName = "Unknown";
        let candidateId = "Unknown";

        $("table").first().find("tr").each((_, tr) => {
            const text = $(tr).text();
            if (text.includes("Candidate Name")) {
                candidateName = $(tr).find("td").last().text().trim();
            }
            if (text.includes("Candidate ID")) {
                candidateId = $(tr).find("td").last().text().trim();
            }
        });

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
                        return false; // break cheerio each
                    }
                }
            });

            if (!masterQNum) return;

            const mapping: Record<string, string> = {};
            qRow.find("td").each((_, td) => {
                const text = $(td).text().trim();
                if (["A.", "B.", "C.", "D."].includes(text)) {
                    const img = $(td).find("img");
                    if (img.length > 0) {
                        const src = img.attr("src") || "";
                        const filename = src.split("/").pop()?.replace(".png", "") || "";
                        const masterOpt = filename.slice(-1).toUpperCase();
                        mapping[text[0]] = masterOpt;
                    }
                }
            });

            let qType = "";
            let statusStr = "";
            let chosenOpt = "";
            let givenAns = "";

            const menuTds = menu.find("td");
            menuTds.each((i, td) => {
                const text = $(td).text().trim();
                if (text.includes("Question Type")) {
                    qType = $(menuTds[i + 1]).text().trim();
                }
                if (text.includes("Status")) {
                    statusStr = $(menuTds[i + 1]).text().trim();
                }
                if (text.includes("Chosen Option")) {
                    chosenOpt = $(menuTds[i + 1]).text().trim();
                }
            });

            if (qType === "NAT" && (statusStr === "Answered" || statusStr === "Answered and Marked for Review")) {
                qRow.find("td").each((i, td) => {
                    if ($(td).text().trim().includes("Given Answer :")) {
                        givenAns = $(td).next("td").text().trim();
                    }
                });
            }

            responses[masterQNum] = {
                status: statusStr,
                type: qType,
                chosen_opt: chosenOpt,
                given_ans: givenAns,
                mapping
            };
        });

        // Evaluation Logic
        let totalMarks = 0;
        let positiveMarks = 0;
        let negativeMarks = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;

        const questionsData = [];

        // Process based on answer_key keys structure (1 to 65)
        for (const qKey of Object.keys(answerKey).sort((a, b) => Number(a) - Number(b))) {
            const qNum = Number(qKey);
            const kData = answerKey[qNum];
            const rData = responses[qNum];

            const qMarks = getMarks(qNum);
            const negMarks = getNegMarks(qNum, kData.type);

            let qInfo: any = {
                q_num: qNum,
                type: kData.type,
                section: kData.section,
                max_marks: qMarks,
                neg_marks_if_wrong: negMarks,
                status: "Unanswered",
                given_ans: null,
                correct_ans: kData.key,
                eval_status: "----",
                marks_obtained: 0
            };

            if (!rData || !["Answered", "Answered and Marked for Review"].includes(rData.status)) {
                unansweredCount++;
                questionsData.push(qInfo);
                continue;
            }

            qInfo.status = rData.status;
            let isCorrect = false;

            if (kData.type === "MCQ") {
                if (rData.chosen_opt) {
                    const localAns = rData.chosen_opt.toUpperCase();
                    const masterAns = rData.mapping[localAns] || "";
                    qInfo.given_ans = masterAns;
                    if (masterAns === kData.key.toUpperCase()) {
                        isCorrect = true;
                    }
                }
            } else if (kData.type === "MSQ") {
                if (rData.chosen_opt) {
                    const localOpts = rData.chosen_opt.split(",").map((x: string) => x.trim().toUpperCase());
                    const masterOptsArr = localOpts.map((x: string) => rData.mapping[x] || "").filter(Boolean);
                    const masterOpts = new Set(masterOptsArr);
                    qInfo.given_ans = Array.from(masterOpts).sort().join(";");

                    const correctOpts = new Set(kData.key.split(";").map((x: string) => x.trim().toUpperCase()));

                    if (masterOpts.size === correctOpts.size && [...masterOpts].every(opt => correctOpts.has(opt))) {
                        isCorrect = true;
                    }
                }
            } else if (kData.type === "NAT") {
                if (rData.given_ans) {
                    qInfo.given_ans = rData.given_ans;
                    const candVal = parseFloat(rData.given_ans);
                    if (!isNaN(candVal)) {
                        const ranges = kData.key.split("to");
                        if (ranges.length === 2) {
                            const minVal = parseFloat(ranges[0].trim());
                            const maxVal = parseFloat(ranges[1].trim());
                            if (candVal >= minVal && candVal <= maxVal) {
                                isCorrect = true;
                            }
                        }
                    }
                }
            }

            if (isCorrect) {
                totalMarks += qMarks;
                positiveMarks += qMarks;
                correctCount++;
                qInfo.eval_status = "PASS";
                qInfo.marks_obtained = qMarks;
            } else {
                totalMarks -= negMarks;
                negativeMarks += negMarks;
                incorrectCount++;
                qInfo.eval_status = "FAIL";
                qInfo.marks_obtained = -negMarks;
            }

            questionsData.push(qInfo);
        }

        const summary = {
            total_questions: 65,
            attempted: correctCount + incorrectCount,
            correct: correctCount,
            incorrect: incorrectCount,
            positive_marks: positiveMarks,
            negative_marks: negativeMarks,
            total_marks: totalMarks
        };

        // Save to NeonDB via Prisma
        try {
            if (process.env.DATABASE_URL) {
                await prisma.prediction.upsert({
                    where: { url },
                    update: {
                        subject,
                        name: candidateName,
                        candidateId: candidateId,
                        totalScore: totalMarks,
                        attempted: summary.attempted,
                        correct: summary.correct,
                        incorrect: summary.incorrect,
                        positiveMarks: summary.positive_marks,
                        negativeMarks: summary.negative_marks,
                    },
                    create: {
                        url,
                        subject,
                        name: candidateName,
                        candidateId: candidateId,
                        totalScore: totalMarks,
                        attempted: summary.attempted,
                        correct: summary.correct,
                        incorrect: summary.incorrect,
                        positiveMarks: summary.positive_marks,
                        negativeMarks: summary.negative_marks,
                    }
                });
            }
        } catch (e) {
            console.error("Prisma save failed:", e);
        }

        return {
            success: true,
            candidate: {
                name: candidateName,
                id: candidateId,
            },
            summary,
            questions: questionsData
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

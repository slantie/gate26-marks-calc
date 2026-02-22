import { analyzeResponseSheet } from './src/app/actions';

async function testCS2Full() {
    const url = "https://cdn.digialm.com//per/g01/pub/585/touchstone/AssessmentQPHTMLMode1//GATE2565/GATE2565S4D10045/17706401653426788/CS26S42012104_GATE2565S4D10045E1.html";
    const result = await analyzeResponseSheet(url, 'CS2');
    console.log("Candidate:", result.candidate);
    console.log("Summary:", result.summary);
    if (!result.success) {
        console.log("ERROR", result.error);
    }
}

testCS2Full();

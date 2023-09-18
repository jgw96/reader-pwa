import {pipeline, env} from '@xenova/transformers';

self.onmessage = async (event) => {
    switch (event.data.type) {
        case 'summarize':
            console.log("summarizing")
            const summary = await summarize(event.data.context);
            self.postMessage({ type: 'summary', summary: summary[0].summary_text });
            break;
        case 'question':
            const answer = await askQuestion(event.data.question, event.data.context);
            self.postMessage({ type: 'answer', answer: answer.answer });
            break;
    }
};

let questionPipeline: any | null = null;
let summaryPipeline: any | null = null;

async function askQuestion(question: string, context: string) {

    // @ts-ignore
    env.allowLocalModels = false;

    if (!questionPipeline) {
        // Allocate a pipeline for sentiment-analysis
        questionPipeline = await pipeline('question-answering');
    }

    let out = await questionPipeline(question, context);
    // [{'label': 'POSITIVE', 'score': 0.999817686}]

    console.log("out", out);

    return out;
}

async function summarize(context: string) {

    // @ts-ignore
    env.allowLocalModels = false;

    if (!summaryPipeline) {
        // Allocate a pipeline for sentiment-analysis
        summaryPipeline = await pipeline('summarization');
    }

    let out = await summaryPipeline(context);
    // [{'label': 'POSITIVE', 'score': 0.999817686}]

    console.log("out", out);

    return out;
}


export async function askQuestion(question: string, context: string) {
    return new Promise((resolve) => {
        const worker = new Worker(new URL("../services/ai-worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event) => {
            if (event.data.type === "answer") {
                console.log("answer", event.data.answer);
                resolve(event.data.answer);
            }
        }

        worker.postMessage({
            type: "question",
            question,
            context
        });
    })

}

export async function summarize(context: string) {
    return new Promise((resolve) => {
        const worker = new Worker(new URL("../services/ai-worker.ts", import.meta.url), { type: "module" });
        console.log("worker", worker)

        worker.onmessage = (event) => {
            if (event.data.type === "summary") {
                console.log("summary", event.data.summary);
                resolve(event.data.summary);
            }
        }

        worker.postMessage({
            type: "summarize",
            context
        });
    })
}

export async function getText(blob: Blob) {
    const response = await fetch("https://reader-vision.cognitiveservices.azure.com/computervision/imageanalysis:analyze?api-version=2023-02-01-preview&features=tags,read", {
        method: "POST",
        headers: new Headers({
            "Ocp-Apim-Subscription-Key": import.meta.env.VITE_VISION_KEY,
            "Content-Type": "application/octet-stream",
        }),
        body: blob,
    });

    const data = await response.json();
    console.log("getText", data);

    return await data;
}

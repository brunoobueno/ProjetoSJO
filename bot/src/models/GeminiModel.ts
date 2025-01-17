import { Message } from "whatsapp-web.js";
import { AiModel } from "./AiModel";
import { ENV } from "../lib/env";
import { useSpinner } from "../hooks/useSpinner";
import { MessageTemplates } from "../util/MessageTemplates";
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiModel extends AiModel<string> {
    public constructor() {
        super(ENV.geminiKey, 'Gemini');
        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    async generateResponse(prompt: string): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent(prompt);
            const res = (await result.response).text();

            return res;
        } catch (err) {
            throw err;
        }
    }

    async sendMessage(prompt: string, msg: Message): Promise<any> {
        const spinner = useSpinner(MessageTemplates.requestStr(this.aiModelName, msg.from, prompt));
        spinner.start();

        try {
            const startTime = Date.now();

            // check out more at: https://ai.google.dev/tutorials/node_quickstart
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro"});

            const result = await model.generateContent(prompt);
            const res = (await result.response).text();
            
            msg.reply(res);

            spinner.succeed(
                MessageTemplates.reqSucceedStr(
                    this.aiModelName,
                    msg.from,
                    res,
                    Date.now() - startTime
                )
            );
        } catch(err) {
            spinner.fail(
                MessageTemplates.reqFailStr(
                    this.aiModelName,
                    'at ChatGptModel.ts sendMessage(prompt, msg)',
                    err
                )
            );
            msg.reply('Infelizmente eu não posso falar sobre esse assunto, pois pela minha programação é intendida como ofensivo ou prejudicial');
        }
        
    }

    private genAI: GoogleGenerativeAI
}


export { GeminiModel }
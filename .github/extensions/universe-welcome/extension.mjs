import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { joinSession, createCanvas } from "@github/copilot-sdk/extension";

const READ_ONLY = "Keep this session and its checkout. ";
const EXAMPLES = {
    skills:
        READ_ONLY + "I'm following the Skills guide in the Universe '26 welcome canvas. Open .github/skills/issue-to-pr/SKILL.md from this checkout in the editor and explain how it is built, without creating a fork or changing anything. Ask before any edit, commit, push, issue, or pull request.",
    tools:
        READ_ONLY + "Help me with the Tools and Connectors guide. No fork is needed. Use the public Microsoft Learn MCP server at https://learn.microsoft.com/api/mcp (no account or API key) for a public documentation query. Ask before installing or changing configuration, send no repository contents to the connector, and report missing tools instead of substituting web search.",
    security:
        READ_ONLY + "I'm following the Security review guide. Find the issue-to-pr pull request from this session, run /security-review on it, and explain any finding. Ask before applying a fix.",
    automate:
        READ_ONLY + "Help me follow the Automate guide: open Automations, choose New Automation, select the project that is my verified fork of virtual-universe-26, enter /issue-to-pr, and choose the Manual trigger. Do not create, enable, or run an automation without my approval.",
};
const files = {
    "/": ["welcome.html", "text/html; charset=utf-8"],
    "/avatar.svg": ["avatar.svg", "image/svg+xml"],
    "/new-automation.png": ["new-automation.png", "image/png"],
    "/walkthroughs.js": ["walkthroughs.js", "text/javascript; charset=utf-8"],
};
const MAX_TEXT = 16000;
const MAX_BODY = 64 * 1024;
const servers = new Map();
let session;

function json(res, status, value) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(value));
}

async function readBody(req) {
    let body = "";
    for await (const chunk of req) {
        body += chunk;
        if (body.length > MAX_BODY) return null;
    }
    return body;
}

async function startServer() {
    let origin = "";
    const server = createServer(async (req, res) => {
        res.setHeader("Cache-Control", "no-store");
        const path = req.url.split("?")[0];
        if (req.method === "POST" && (path === "/open-skill" || path === "/try")) {
            if (req.headers.origin !== origin) return json(res, 403, { error: "Forbidden origin" });
            if (path === "/open-skill") {
                try {
                    await session.rpc.canvas.open({
                        canvasId: "editor",
                        instanceId: "universe-issue-to-pr-skill",
                        input: { scope: "repo", path: ".github/skills/issue-to-pr/SKILL.md", title: "Issue to PR skill" },
                    });
                    return json(res, 200, { ok: true });
                } catch (error) {
                    console.error("Could not open the local skill file:", error);
                    return json(res, 500, { error: "Could not open the skill. Ask Copilot to open .github/skills/issue-to-pr/SKILL.md." });
                }
            }
            const raw = await readBody(req);
            if (raw === null) return json(res, 413, { error: "Message too long" });
            let payload;
            try {
                payload = JSON.parse(raw || "{}");
            } catch {
                return json(res, 400, { error: "Invalid JSON" });
            }
            if (!payload || typeof payload !== "object" || !Object.hasOwn(EXAMPLES, payload.id)) {
                return json(res, 400, { error: "Unknown guide" });
            }
            if (payload.text !== undefined && typeof payload.text !== "string") {
                return json(res, 400, { error: "Message must be text" });
            }
            if (payload.text && payload.text.length > MAX_TEXT) return json(res, 413, { error: "Message too long" });
            try {
                await session.send({ prompt: payload.text || EXAMPLES[payload.id] });
            } catch (error) {
                return json(res, 500, { error: error?.message || "Could not send to the chat" });
            }
            return json(res, 200, { ok: true });
        }
        const entry = req.method === "GET" ? files[path] : undefined;
        if (!entry) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", entry[1]);
        res.end(await readFile(new URL(`./${entry[0]}`, import.meta.url)));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    return { server, url: `${origin}/` };
}

session = await joinSession({
    canvases: [
        createCanvas({
            id: "universe-welcome",
            displayName: "Universe '26 welcome",
            description: "Welcome screen for the Universe '26 Section 2 cookbook: introduces building an automation with skills, tools and connectors, security review, and triggers.",
            actions: [],
            open: async (ctx) => {
                let entry = servers.get(ctx.instanceId);
                if (!entry) {
                    entry = await startServer();
                    servers.set(ctx.instanceId, entry);
                }
                return { title: "Welcome to Universe '26", url: entry.url };
            },
            onClose: async (ctx) => {
                const entry = servers.get(ctx.instanceId);
                if (entry) {
                    servers.delete(ctx.instanceId);
                    await new Promise((resolve) => entry.server.close(() => resolve()));
                }
            },
        }),
    ],
});

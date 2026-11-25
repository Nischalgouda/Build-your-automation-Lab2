// Step-by-step guides opened by "Start" on the welcome canvas.
// Block types: string = paragraph (HTML), {k:"term"|"chat"|"file"|"diff", label?, text}, {note}, {table:[[q,a],...]},
// {link:{href,text}} = a deep link button, {list:[text]} = bullet points, {openSkill:true}, {img}.
// Chat blocks have a "Send to this chat" button that posts the text to the session that opened the guide.
window.WALK = {
skills: {
  eyebrow: "SKILLS · GUIDE",
  title: "Create and run your first skill",
  time: "15 min",
  intro: "A skill is a set of instructions, scripts, and resources that Copilot loads when needed to perform a specialized task.<br><br>In this guide you'll read the <code>issue-to-pr</code> skill, edit it, and then run it with a slash command.",
  steps: [
    { h: "Ask Copilot to open the skill", body: [
      "Read only for now: no fork or account setup is needed to look at a skill. By convention, each skill gets its own folder, <code>.github/skills/my-skill/</code>, with a Markdown file named <code>SKILL.md</code> inside it.",
      "A <code>SKILL.md</code> file has two parts: the YAML frontmatter between the two <code>---</code> lines (the <b>name</b> becomes the slash command and the <b>description</b> tells Copilot when to use it), and the body, which lists the steps Copilot follows and the rules it must keep.",
      { k: "file", label: ".github/skills/my-skill/SKILL.md", text: `---
name: my-skill
description: What the skill does and when to use it.
---

# My skill
1. The first thing to do
2. The next thing to do

## Rules
- Something it must never do` },
      "<b>Send this to the chat</b> to open the real skill in the editor:",
      { k: "chat", noOpen: true, text: "Open .github/skills/issue-to-pr/SKILL.md from this checkout in the editor. Read only: don't change anything, and don't create a fork or another session." },
      { openSkill: true },
    ]},
    { h: "Ready to make changes?", body: [
      "Reading needed no fork. To save edits, create issues, or open pull requests you need your own fork of the event repository. Copilot does this in this same session and checkout.",
      { k: "chat", noOpen: true, text: `I'm ready to make changes. Inspect this checkout (branch, status, and remotes). Reuse my existing fork of octodemo/virtual-universe-26, or create one with gh repo fork octodemo/virtual-universe-26 --clone=false --default-branch-only, and verify its parent and my access. Work in the same checkout and keep this session. Preserve origin and my local work; if a remote is needed, propose a named workshop-fork remote and ask first. Do not open another session or clone. Show me the exact fork and working branch, and ask before creating or changing anything.` },
      { note: "Origin may still be the event repository. Copilot pushes only to the verified fork, never to origin." },
    ]},
    { h: "Make one useful edit", body: [
      "<b>Replace</b> the <code>gh pr create</code> line in step 6 of the skill with this, then save the file:",
      { k: "diff", label: ".github/skills/issue-to-pr/SKILL.md", text: ` 6. Commit only the files you changed for this issue, push the branch to the
    fork, and open a draft pull request that closes the issue:
-   \`gh pr create --draft --title "Fix #<n>: <issue title>" --body "Closes #<n>"\`
+   \`gh pr create --draft --title "Fix #<n>: <issue title>" --body "<body>"\`
+   Start the body with "Closes #<n>", then add a short summary and a
+   "How to test" section with the exact commands a reviewer can run.` },
      "This change makes every pull request explain how to test it. Run <code>/skills reload</code> afterward so Copilot picks up your edit.",
    ]},
    { h: "Create a sample issue", body: [
      "Give the skill something real to fix: a small feature in the <code>universe-notes</code> sample app.",
      { k: "chat", noOpen: true, text: `In my verified fork (not the event repository), create an issue titled "Add a list command to universe-notes" with the body "Add an npm script so 'npm run list' prints each keynote highlight title from universe-notes/notes/keynote-highlights.json, grouped by topic." Show me the fork and ask for approval before creating it, then tell me the issue number.` },
    ]},
    { h: "Run the skill with its slash command", body: [
      "<b>Type</b> <code>/issue-to-pr</code> followed by the issue number in this session's chat. If you leave off the number, Copilot lists your open issues and asks which one.",
      "Copilot shows its changes and asks before it commits, pushes to your fork, and opens a draft pull request.",
    ]},
    { h: "Review the draft pull request", body: [
      "Open the pull request link Copilot shares in chat and check that it has a <b>How to test</b> section.",
      { note: "Leave the pull request open. You'll review it for security issues later in this section." },
    ]},
  ],
  done: "You edited a skill and ran it with a slash command. Next, give your agent more tools.",
  next: "tools",
},

tools: {
  eyebrow: "TOOLS · GUIDE",
  title: "Give Copilot the right tools and context",
  time: "10 min",
  intro: "A connector gives Copilot access to tools and information it doesn't have built in.<br><br>APIs change, and Copilot's built-in knowledge may be out of date. A documentation connector lets your issue-to-pr skill base its fixes on current documentation, with sources you can check.",
  steps: [
    { h: "Find a documentation tool", body: [
      "No fork or repository changes are needed for this guide. Agent Finder only searches; it never installs anything.",
      { k: "chat", noOpen: true, text: `/agentfinder find an MCP server that gives my coding agent current Microsoft and .NET documentation` },
      "This guide uses the public <b>Microsoft Learn MCP server</b>. It needs no account or API key.",
    ]},
    { h: "Add the connector", body: [
      "<b>Click the button</b> to review and install it. Nothing is installed until you confirm.",
      { link: { href: "ghapp://mcp/install?" + encodeURIComponent(JSON.stringify({ name: "microsoft-learn", type: "http", url: "https://learn.microsoft.com/api/mcp" })), text: "Install Microsoft Learn MCP" } },
      "If the button doesn't work, open <b>Customize</b> in the sidebar, add an HTTP server, and enter <code>https://learn.microsoft.com/api/mcp</code>. If a restart is needed, Copilot will explain it and ask first.",
    ]},
    { h: "Try a documentation lookup", body: [
      { k: "chat", noOpen: true, text: `Use the Microsoft Learn MCP connector to find how to read a text file with System.IO.File in C#. Show a short example and its documentation source. Send only this public query. If the connector isn't available in this session, tell me; don't substitute web search.` },
      "Look for a Microsoft Learn tool call and a linked documentation source. The connector retrieves documentation; it doesn't certify that a PR is correct.",
    ]},
    { h: "Use it in your skill", body: [
      { k: "chat", noOpen: true, text: `Update .github/skills/issue-to-pr/SKILL.md to use the Microsoft Learn MCP connector when a fix needs library or API documentation. Send only public documentation queries, cite relevant sources in the draft PR, and report unavailable tools instead of pretending a lookup succeeded. Show me the edit; don't commit or push yet.` },
    ]},
  ],
  done: "Your skill can now ask for current documentation. Next, review the draft PR for security issues.",
  next: "security",
},

security: {
  eyebrow: "SECURITY REVIEW · GUIDE",
  title: "Review the agent's work for security issues",
  time: "10 min",
  intro: "Copilot has a built-in <code>/security-review</code> skill. It checks changed code and reports only vulnerabilities it is confident someone could exploit. In this guide you run it on the fix in the PR and make the review part of your skill.",
  steps: [
    { h: "Run the review on the fix in the PR", body: [
      { k: "chat", noOpen: true, text: `/security-review Review the last PR created by the issue-to-pr skill in this chat. Use the chat history to identify it and review the fix in that PR, not unrelated local changes. If the PR is unclear, ask me which one.` },
      "The review shows findings with severity, file, lines, and confidence. No findings is a good result.",
    ]},
    { h: "Add the review to your skill", body: [
      { k: "chat", noOpen: true, text: `Update .github/skills/issue-to-pr/SKILL.md so it runs the built-in /security-review skill on its changes after making the fix and before committing and opening the pull request. Fix any HIGH or CRITICAL findings, and list any others in the pull request body. Renumber the following steps. Show me the edit and ask before committing.` },
    ]},
    { h: "Run it on a new issue", body: [
      { k: "chat", noOpen: true, text: `In my verified fork, create an issue titled "Add a search command to universe-notes" with the body "Add 'npm run search -- <word>' that prints highlights whose title or summary contains the word." Ask for approval first, then tell me the issue number.` },
      "Then <b>type</b> <code>/issue-to-pr</code> and the issue number. Copilot now runs the security review before it opens the pull request.",
    ]},
  ],
  done: "Your skill now checks its own work for security issues. Next, let a trigger start it for you.",
  next: "automate",
},

automate: {
  eyebrow: "AUTOMATE · GUIDE",
  title: "Turn your skill into an Automation",
  time: "5 min",
  intro: "Save your skill as an automation so you can run it again without rewriting the prompt. You can schedule it, but for this tutorial you'll trigger it manually.",
  steps: [
    { h: "Create an automation", body: [
      "<b>Open Automations</b> in the app sidebar and <b>click New Automation</b>.",
      "Give it a name, such as <code>Issue to PR</code>. Under <b>Trigger</b>, choose <b>Manual</b>.",
    ]},
    { h: "Select your project and skill", body: [
      "<b>Click the project selector</b> below the prompt box, marked by the green arrow, and select <b>your fork of virtual-universe-26</b>, not <code>octodemo/virtual-universe-26</code>. An automation is bound to the app project, so it must be the fork.",
      { img: { src: "new-automation.png", alt: "New automation form. The green arrow points to the project selector below the prompt box.", projectArrow: true } },
      "The screenshot shows the event repository and a Daily trigger. Use <b>your fork</b> and <b>Manual</b> instead.",
      "<b>Type <code>/issue-to-pr</code></b> in the prompt box, select the skill suggestion, and add this text after it:",
      { k: "chat", label: "Automation prompt", noOpen: true, text: `Find the oldest open issue in this fork that has no linked pull request and use this skill to propose a fix. Notify me when the PR is ready to be reviewed.` },
    ]},
    { h: "Save and run when ready", body: [
      "<b>Click Create</b> to save the automation. With a Manual trigger, it won't run until you start it. Start with it paused if you prefer.",
      "When you're ready, <b>click the play button</b> and review the draft PR it produces. Nothing merges without your review.",
    ]},
  ],
  done: "🎉 <b>Congratulations on completing this tutorial!</b><br><br>You built an <code>issue-to-pr</code> skill that turns an issue into a draft pull request, connected a documentation tool, added a security review, and saved it as an automation you can run on demand.<br><br>For more resources, visit the <a href=\"https://github.com/octodemo/virtual-universe-26\" target=\"_blank\" rel=\"noopener\">Virtual Universe '26 repository</a>.",
},
};

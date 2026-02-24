diff --git a/batch/api/chat.js b/batch/api/chat.js
new file mode 100644
index 0000000000000000000000000000000000000000..26d0e28d3753dae57677fd2de227d6cd3a3d7cc2
--- /dev/null
+++ b/batch/api/chat.js
@@ -0,0 +1,63 @@
+export default async function handler(req, res) {
+  if (req.method !== "POST") {
+    return res.status(405).json({ error: "Method not allowed" });
+  }
+
+  try {
+    const { message } = req.body || {};
+
+    if (!message || typeof message !== "string") {
+      return res.status(400).json({ error: "Message is required" });
+    }
+
+    const rawApiKey =
+      process.env.CLAUDE_API_KEY ||
+      process.env.ANTHROPIC_API_KEY ||
+      process.env.CLAUDE_KEY;
+
+    const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : "";
+
+    if (!apiKey) {
+      return res.status(500).json({
+        error:
+          "Server is missing Anthropic API key. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in environment variables."
+      });
+    }
+
+    if (apiKey.length < 20) {
+      return res.status(500).json({
+        error:
+          "Anthropic API key appears invalid. Re-save CLAUDE_API_KEY/ANTHROPIC_API_KEY in Vercel (no quotes, no extra spaces) and redeploy."
+      });
+    }
+
+    const response = await fetch("https://api.anthropic.com/v1/messages", {
+      method: "POST",
+      headers: {
+        "x-api-key": apiKey,
+        "anthropic-version": "2023-06-01",
+        "content-type": "application/json"
+      },
+      body: JSON.stringify({
+        model: "claude-3-5-sonnet-20241022",
+        max_tokens: 500,
+        messages: [{ role: "user", content: message }]
+      })
+    });
+
+    const data = await response.json();
+
+    if (!response.ok) {
+      return res.status(response.status).json({
+        error: data?.error?.message || "Upstream AI request failed"
+      });
+    }
+
+    return res.status(200).json({
+      reply: data.content?.[0]?.text || "No response"
+    });
+  } catch (error) {
+    console.error(error);
+    return res.status(500).json({ error: "Internal server error" });
+  }
+}




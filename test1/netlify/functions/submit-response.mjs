import { Octokit } from "@octokit/rest";

export async function handler(event) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const payload = JSON.parse(event.body);
  const { username, answer } = payload;

  const owner = "okmr-1224";
  const repo = "Question";
  const filePath = "data/responses.json";

  const baseBranch = "main";
  const prBranch = `response-${Date.now()}`;
  const commitMessage = `Add response from ${username}`;

  try {
    // ✅ mainブランチの最新コミットのSHAを取得
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = refData.object.sha;

    // ✅ responses.json の現在の中身を取得
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: baseBranch,
    });

    const content = Buffer.from(file.content, "base64").toString();
    const json = JSON.parse(content);
    json.push({ username, answer });

    const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    // ✅ 新しいブランチを baseSha から作成
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${prBranch}`,
      sha: baseSha, // ← これが超重要！！
    });

    // ✅ そのブランチに responses.json をアップデート
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: newContent,
      branch: prBranch,
      sha: file.sha, // ← これはOK（元ファイルのバージョン）
    });

    // ✅ PR 作成
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: commitMessage,
      head: prBranch,
      base: baseBranch,
      body: "New survey response submitted.",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "PR created", url: pr.html_url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

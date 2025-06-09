import { Octokit } from "@octokit/rest";

export async function handler(event) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const payload = JSON.parse(event.body);
  const { username, answer, comment } = payload;

  const owner = "okmr-1224";
  const repo = "Question";
  const filePath = "data/responses.json";
  const branch = "main";
  const prBranch = `response-${Date.now()}`;
  const commitMessage = `Add response from ${username}`;

  try {
    // ✅ mainブランチの最新コミットSHAを取得
    const { data: mainRef } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = mainRef.object.sha;

    // ✅ ファイル内容を取得
    const { data: file } = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branch });
    const content = Buffer.from(file.content, "base64").toString();
    const json = JSON.parse(content);

    // ✅ 新しいデータを追加
    json.push({ username, answer, comment, timestamp: Date.now() });
    const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    // ✅ 新しいブランチを作成
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${prBranch}`,
      sha: latestCommitSha
    });

    // ✅ ファイルを更新
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: newContent,
      branch: prBranch,
    });

    // ✅ PR作成
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: commitMessage,
      head: prBranch,
      base: branch,
      body: "New survey response submitted.",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "PR created", url: pr.html_url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}

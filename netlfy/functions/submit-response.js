// netlify/functions/submit-response.js
const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const payload = JSON.parse(event.body);
  const { username, answer } = payload;

  // ここでリポジトリ情報を指定
  const owner = "okmr-1224";
  const repo = "survey-responses";
  const filePath = "responses.json";

  const branch = "main";
  const prBranch = `response-${Date.now()}`;
  const commitMessage = `Add response from ${username}`;

  try {
    // 元のファイルを取得
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });

    const content = Buffer.from(file.content, "base64").toString();
    const json = JSON.parse(content);
    json.push({ username, answer });

    const newContent = Buffer.from(JSON.stringify(json, null, 2)).toString("base64");

    // 新しいブランチを作成
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${prBranch}`,
      sha: file.sha,
    });

    // ファイルを更新（新しいブランチ上で）
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: newContent,
      branch: prBranch,
    });

    // PRを作成
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
      body: JSON.stringify({ message: "PR created", url: pr.html_url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

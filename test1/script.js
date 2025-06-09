document.getElementById('survey-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const answer = form.answer.value;
  const comment = form.comment.value;

  const res = await fetch('/.netlify/functions/submit-response', {
    method: 'POST',
    body: JSON.stringify({ username, answer, comment })
  });

  const msg = document.getElementById('message');
  if (res.ok) {
    msg.textContent = '送信完了！ありがとう💖';
    form.reset();
    loadChart();
  } else {
    msg.textContent = '送信失敗しちゃった…😢';
  }
});

async function loadChart() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/okmr-1224/Question/main/data/responses.json');
    if (!response.ok) throw new Error('fetch失敗！');
    const data = await response.json();

    // 集計
    const counts = {};
    for (const entry of data) {
      counts[entry.answer] = (counts[entry.answer] || 0) + 1;
    }

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const backgroundColors = labels.map(label => {
      switch (label) {
        case '炎': return '#ff6b6b';
        case '水': return '#4dabf7';
        case '草': return '#69db7c';
        default: return '#d0bfff';
      }
    });

    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });

    // 最新3件表示
    const latestDiv = document.getElementById('latest');
    const recent = data.slice(-3).reverse();
    latestDiv.innerHTML = '<h3>最新の回答✨</h3>' + recent.map(entry =>
      `<p><strong>${entry.username}</strong>：${entry.answer} <br><em>${entry.comment || "（コメントなし）"}</em></p>`
    ).join('');
  } catch (err) {
    console.error('グラフ読み込み失敗！', err);
    document.getElementById('message').textContent = 'グラフ読み込みに失敗しました😢';
  }
}

window.addEventListener('DOMContentLoaded', loadChart);